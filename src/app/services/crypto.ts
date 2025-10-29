// src/app/services/crypto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = "https://api.coingecko.com/api/v3/coins/markets";

  constructor(private http: HttpClient) { }

  getMarketData(currency: string, ids: string[]): Observable<any> {
    const params = new HttpParams()
      .set('vs_currency', currency)
      .set('ids', ids.join(','))
      .set('sparkline', 'true')
      .set('price_change_percentage', '1h,24h,7d');

    return this.http.get(this.apiUrl, { params: params });
  }
}