import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Gerbang ke kie.ai (Jobs API, model nano-banana-2). Endpoint + bentuk respons
// terverifikasi via test call langsung (bukan cuma docs) 2026-07-10:
//   POST {baseUrl}/api/v1/jobs/createTask -> { code, data:{ taskId } }
//   GET  {baseUrl}/api/v1/jobs/recordInfo?taskId=... -> data.state + data.resultJson
//     (resultJson adalah JSON STRING bersarang, wajib di-parse ulang).
// Semua task async: 200 cuma artinya task dibuat, bukan selesai.
export interface CreateTaskInput {
  prompt?: string;
  negativePrompt?: string; // nano-banana-2 tak punya field negative_prompt -> dilebur ke prompt
  size: string; // aspect_ratio nano-banana-2: 1:1|4:5|9:16|16:9|dst, atau "auto"
  filesUrl?: string[]; // -> input.image_input (maks 14 di kie.ai; DTO kita batasi 5)
  callBackUrl?: string;
}

// Guardrail standing yang WAJIB nempel di tiap prompt kie.ai: jaga detail
// produk & skala realistis. Ditulis sbg default yg mengalah ke instruksi
// eksplisit di prompt itu sendiri (skala absurd yg DISENGAJA tim kreatif
// tetap jalan, karena model utamakan deskripsi konkret di atas guardrail
// umum). Lapis kedua di luar SKILL.md content-brief -- berlaku juga utk
// prompt manual (bukan cuma hasil skill).
const DETAIL_AND_SCALE_GUARDRAIL =
  'Preserve the product exactly as described -- accurate shape, color, logo, texture, and material detail; do not simplify, distort, or obscure product features. Keep object scale realistic and proportionate to real-world size, unless the description explicitly asks for a surreal or exaggerated scale.';

function buildFinalPrompt(prompt: string | undefined, negativePrompt: string | undefined): string {
  const parts = [prompt?.trim() || '', DETAIL_AND_SCALE_GUARDRAIL];
  if (negativePrompt?.trim()) parts.push(`Avoid: ${negativePrompt.trim()}.`);
  return parts.filter(Boolean).join(' ');
}

export interface TaskStatus {
  status: 'pending' | 'done' | 'error';
  resultUrls: string[];
  errorMessage?: string;
}

@Injectable()
export class KieaiService {
  private readonly log = new Logger(KieaiService.name);

  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.get<string>('KIEAI_BASE_URL') ?? 'https://api.kie.ai';
  }

  private get model(): string {
    return this.config.get<string>('KIEAI_MODEL') ?? 'nano-banana-2';
  }

  private get apiKey(): string {
    const key = this.config.get<string>('KIEAI_API_KEY');
    if (!key) {
      throw new ServiceUnavailableException(
        'Kredensial kie.ai belum diset (KIEAI_API_KEY). Hubungi Owner.',
      );
    }
    return key;
  }

  // Create-task cepat (fire-and-forget confirmation), bukan generatif sinkron
  // seperti OpenClaw -> timeout jauh lebih pendek.
  private get timeoutMs(): number {
    return Number(this.config.get<string>('KIEAI_TIMEOUT_MS') ?? '30000');
  }

  async createTask(input: CreateTaskInput): Promise<{ taskId: string }> {
    const body: Record<string, unknown> = {
      model: this.model,
      input: {
        prompt: buildFinalPrompt(input.prompt, input.negativePrompt),
        image_input: input.filesUrl ?? [],
        aspect_ratio: input.size,
        resolution: '1K',
        output_format: 'png',
      },
    };
    if (input.callBackUrl) body.callBackUrl = input.callBackUrl;

    const data = await this.request<{ taskId: string }>('POST', '/api/v1/jobs/createTask', body);
    if (!data?.taskId) {
      throw new ServiceUnavailableException('kie.ai tidak mengembalikan taskId.');
    }
    return { taskId: data.taskId };
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const data = await this.request<{
      state: string;
      resultJson?: string;
      failMsg?: string;
    }>('GET', `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);

    return this.parseState(data?.state, data?.resultJson, data?.failMsg);
  }

  // state: waiting | queuing | generating | success | fail. resultJson =
  // JSON string berisi { resultUrls: string[] } -- parse aman (kalau korup,
  // treat sbg pending drpd melempar exception ke reconciliation job).
  private parseState(state: string | undefined, resultJson?: string, failMsg?: string): TaskStatus {
    if (state === 'success') {
      let resultUrls: string[] = [];
      try {
        resultUrls = resultJson ? (JSON.parse(resultJson).resultUrls ?? []) : [];
      } catch {
        this.log.warn(`resultJson tak bisa di-parse: ${resultJson}`);
      }
      return { status: 'done', resultUrls };
    }
    if (state === 'fail') {
      return { status: 'error', resultUrls: [], errorMessage: failMsg || 'Generate gagal di kie.ai.' };
    }
    return { status: 'pending', resultUrls: [] }; // waiting | queuing | generating
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        throw new ServiceUnavailableException(`kie.ai error (HTTP ${res.status}).`);
      }
      const json = (await res.json()) as { code: number; msg?: string; data?: T };
      if (json.code !== 200) {
        throw new ServiceUnavailableException(`kie.ai gagal: ${json.msg ?? json.code}.`);
      }
      return json.data as T;
    } catch (e) {
      if (e instanceof ServiceUnavailableException) throw e;
      const reason = (e as Error)?.name === 'AbortError' ? 'timeout' : 'tidak terhubung';
      this.log.warn(`kie.ai ${reason}: ${String(e)}`);
      throw new ServiceUnavailableException(`kie.ai ${reason}. Cek KIEAI_API_KEY / rate limit.`);
    } finally {
      clearTimeout(timer);
    }
  }
}
