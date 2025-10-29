// src/app/services/crypto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = "https://api.coingecko.com/api/v3/simple/price";

  // Vi "injicerer" HttpClient, så vi kan bruge den i denne service
  constructor(private http: HttpClient) { }

  /**
   * Henter priser for specifikke mønter mod specifikke valutaer.
   * @param ids En liste af mønt-ID'er (f.eks. ['bitcoin', 'ethereum'])
   * @param currencies En liste af valutaer (f.eks. ['usd', 'dkk'])
   */
  getPrices(ids: string[], currencies: string[]): Observable<any> {

    // Byg query-parametrene korrekt
    const params = new HttpParams()
      .set('ids', ids.join(','))
      .set('vs_currencies', currencies.join(','));

    // Lav GET-kaldet og returner den Observable, det giver
    return this.http.get(this.apiUrl, { params: params });
  }
}
