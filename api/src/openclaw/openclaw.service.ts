import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

// Peta skill -> agent OpenClaw khusus per module (jawaban terfokus).
// Routing lewat header x-openclaw-session-key: "agent:<agentId>:<suffix>".
export const SKILL_AGENT: Record<string, string> = {
  'content-brief': 'sf-content-brief',
  copywriting: 'sf-copywriting',
  humanize: 'sf-humanize',
  'ads-generate': 'sf-ads',
};

// Gerbang tunggal ke OpenClaw Gateway (Golden Rule #1: skill = SKILL.md di
// OpenClaw, JANGAN hardcode prompt skill di backend). Backend hanya mengirim
// pemicu tipis + payload lalu memaksa output JSON. Endpoint OpenAI-compatible.
@Injectable()
export class OpenclawService {
  private readonly log = new Logger(OpenclawService.name);

  constructor(private readonly config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.get<string>('OPENCLAW_GATEWAY_URL') ?? 'http://openclaw:18789';
  }
  private get token(): string | undefined {
    return this.config.get<string>('OPENCLAW_TOKEN');
  }
  private get model(): string {
    // Endpoint OpenClaw hanya terima "openclaw" atau "openclaw/<agentId>".
    return this.config.get<string>('OPENCLAW_AGENT_MODEL') ?? 'openclaw';
  }
  // Timeout satu panggilan skill. GPT-5.5 untuk brief/copy berat bisa 40–70s;
  // 60s terlalu mepet (abort → 503) padahal nginx sanggup 300s. Default 120s,
  // bisa dituning via env. Tetap < proxy_read_timeout nginx.
  private get timeoutMs(): number {
    return Number(this.config.get<string>('OPENCLAW_TIMEOUT_MS') ?? '120000');
  }

  // Jalankan skill generatif, kembalikan output ter-parse (JSON) bertipe T.
  // Retry sekali kalau JSON gagal di-parse (SPIKE decision: CONDITIONAL).
  async run<T>(skill: string, payload: Record<string, unknown>): Promise<T> {
    const trigger =
      `Jalankan skill "${skill}" dengan input berikut dan balas HANYA JSON valid ` +
      `sesuai kontrak skill (tanpa markdown fences, tanpa penjelasan):\n` +
      `${JSON.stringify(payload)}`;

    const agentId = SKILL_AGENT[skill];
    let lastErr: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const content = await this.chat(trigger, { agentId });
      try {
        return this.parseJson<T>(content);
      } catch (e) {
        lastErr = e;
        this.log.warn(`Skill ${skill}: JSON parse gagal (attempt ${attempt}).`);
      }
    }
    throw new ServiceUnavailableException(
      `Output skill "${skill}" tidak valid. Coba lagi. (${String(lastErr)})`,
    );
  }

  // Panggil mentah endpoint chat (dipakai skill teks bebas seperti humanize).
  // agentId opsional → route ke agent module tertentu (jawaban terfokus).
  async chat(
    content: string,
    opts: { timeoutMs?: number; agentId?: string } = {},
  ): Promise<string> {
    const { timeoutMs = this.timeoutMs, agentId } = opts;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const started = Date.now();
    try {
      const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          // Session key UNIK per call → skill call stateless: tiap generate
          // fresh, selalu baca SKILL.md terbaru, tak terkontaminasi history
          // panggilan sebelumnya (dan aman untuk request paralel).
          ...(agentId
            ? { 'x-openclaw-session-key': `agent:${agentId}:${randomUUID()}` }
            : {}),
        },
        body: JSON.stringify({
          // Route ke agent module via model "openclaw/<agentId>" (Golden Rule #1).
          model: agentId ? `openclaw/${agentId}` : this.model,
          messages: [{ role: 'user', content }],
        }),
      });
      if (!res.ok) {
        throw new ServiceUnavailableException(
          `OpenClaw Gateway error (HTTP ${res.status}). Cek konfigurasi/kredensial.`,
        );
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content ?? '';
      this.log.debug(`OpenClaw chat ok in ${Date.now() - started}ms`);
      if (!text) {
        throw new ServiceUnavailableException('OpenClaw Gateway balik kosong.');
      }
      return text;
    } catch (e) {
      if (e instanceof ServiceUnavailableException) throw e;
      const reason = (e as Error)?.name === 'AbortError' ? 'timeout' : 'tidak terhubung';
      throw new ServiceUnavailableException(
        `OpenClaw Gateway ${reason}. Pastikan Gateway aktif & OPENCLAW_* terisi.`,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private parseJson<T>(raw: string): T {
    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  }
}
