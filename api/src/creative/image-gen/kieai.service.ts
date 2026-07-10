import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Gerbang ke kie.ai (4o Image API). Endpoint terverifikasi via docs.kie.ai:
//   POST {baseUrl}/api/v1/gpt4o-image/generate  -> { code, data:{ taskId } }
//   GET  {baseUrl}/api/v1/gpt4o-image/record-info?taskId=... -> lihat parseStatus()
// Semua task async: 200 cuma artinya task dibuat, bukan selesai.
export interface CreateTaskInput {
  prompt?: string;
  size: string; // '1:1' | '3:2' | '2:3'
  filesUrl?: string[];
  callBackUrl?: string;
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
    const body: Record<string, unknown> = { size: input.size };
    if (input.prompt) body.prompt = input.prompt;
    if (input.filesUrl?.length) body.filesUrl = input.filesUrl;
    if (input.callBackUrl) body.callBackUrl = input.callBackUrl;

    const data = await this.request<{ taskId: string }>(
      'POST',
      '/api/v1/gpt4o-image/generate',
      body,
    );
    if (!data?.taskId) {
      throw new ServiceUnavailableException('kie.ai tidak mengembalikan taskId.');
    }
    return { taskId: data.taskId };
  }

  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const data = await this.request<{
      status: string;
      response?: { resultUrls?: string[] };
      errorMessage?: string;
    }>('GET', `/api/v1/gpt4o-image/record-info?taskId=${encodeURIComponent(taskId)}`);

    return this.parseStatus(data?.status, data?.response?.resultUrls, data?.errorMessage);
  }

  // Kie.ai pakai vocab status berbeda antar endpoint (create/poll/webhook) --
  // normalisasi ke satu bentuk internal { pending | done | error }.
  private parseStatus(
    status: string | undefined,
    resultUrls: string[] | undefined,
    errorMessage?: string,
  ): TaskStatus {
    if (status === 'SUCCESS') {
      return { status: 'done', resultUrls: resultUrls ?? [] };
    }
    if (status === 'CREATE_TASK_FAILED' || status === 'GENERATE_FAILED') {
      return { status: 'error', resultUrls: [], errorMessage: errorMessage || 'Generate gagal di kie.ai.' };
    }
    return { status: 'pending', resultUrls: [] };
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
