import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, shareReplay } from 'rxjs';
import { BloodRequest } from '../models/blood-request.model';

type NominatimResponse = {
  display_name?: string;
  address?: Record<string, string>;
  lat?: string;
  lon?: string;
};

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private readonly baseUrl = 'http://localhost:3001/api/hospital';

  constructor(private http: HttpClient) {}

  /** POST /api/hospital/create */
  createRequest(data: BloodRequest): Observable<BloodRequest> {
    return this.http
      .post<BloodRequest>(`${this.baseUrl}/create`, data)
      .pipe(catchError(this.handleError));
  }

  /** GET /api/hospital/all */
  getRequests(): Observable<BloodRequest[]> {
    return this.http
      .get<BloodRequest[]>(`${this.baseUrl}/all`)
      .pipe(
        shareReplay(1),
        catchError(this.handleError)
      );
  }

  /**
   * Reverse geocoding via Nominatim.
   * ⚠ If you hit CORS, proxy this through your backend instead of calling directly from the browser.
   */
  getAddress(lat: number, lng: number): Observable<NominatimResponse> {
    const headers = new HttpHeaders({
      // Identify your app per Nominatim policy
      'User-Agent': 'BloodBankApp/1.0 (contact: youremail@example.com)'
    });

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    return this.http
      .get<NominatimResponse>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  /** Centralized HTTP error handling */
  private handleError(error: HttpErrorResponse) {
    const message =
      error.error?.message ??
      (typeof error.error === 'string' ? error.error : null) ??
      `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;

    console.error('[HospitalService] Error:', error);
    return throwError(() => new Error(message));
  }
}