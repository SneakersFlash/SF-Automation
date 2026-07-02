import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';

// Klien Ginee OpenAPI (MB §9). Auth HMAC-SHA256:
//   Authorization: {ACCESS_KEY}:base64(hmac_sha256("POST$<path>$", SECRET_KEY))
//   header X-Advai-Country: ID
export interface GineeOrder {
  channel?: string;
  status?: string;
  totalAmount?: number;
  sku?: string;
  productName?: string;
}

@Injectable()
export class GineeService {
  constructor(private readonly config: ConfigService) {}

  private cfg(key: string): string {
    const v = this.config.get<string>(key);
    if (!v) {
      throw new ServiceUnavailableException(
        `Kredensial Ginee belum diset (${key}). Hubungi Owner.`,
      );
    }
    return v;
  }

  private sign(method: string, path: string, secret: string): string {
    const base = `${method}$${path}$`;
    return createHmac('sha256', secret).update(base).digest('base64');
  }

  async listOrders(path = '/openapi/order/v1/list', body: Record<string, unknown> = {}) {
    const host = this.config.get<string>('GINEE_HOST') ?? 'https://api.ginee.com';
    const accessKey = this.cfg('GINEE_ACCESS_KEY');
    const secretKey = this.cfg('GINEE_SECRET_KEY');
    const country = this.config.get<string>('GINEE_COUNTRY') ?? 'ID';

    const signature = this.sign('POST', path, secretKey);
    let res: Response;
    try {
      res = await fetch(`${host}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${accessKey}:${signature}`,
          'X-Advai-Country': country,
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new ServiceUnavailableException('Tidak bisa terhubung ke Ginee.');
    }
    if (!res.ok) {
      throw new ServiceUnavailableException(`Ginee error (HTTP ${res.status}).`);
    }
    const data = (await res.json()) as { data?: { list?: GineeOrder[] } };
    return data.data?.list ?? [];
  }
}
