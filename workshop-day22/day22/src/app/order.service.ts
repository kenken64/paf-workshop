import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { OrderCount } from './order.count';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  httpOptions = {
    headers: new HttpHeaders({ 
      'Content-Type': 'application/json',  
      'Accept': 'application/json'})
  };

  headers : HttpHeaders = new HttpHeaders({ 
    'Content-Type': 'application/json',  
    'Accept': 'application/json'});
  
  constructor(private http: HttpClient) { }

  getOrderCountDetails(orderId: string): Observable<OrderCount[]> {
    return this.http.get<OrderCount[]>(`${environment.apiUrl}${orderId}`, this.httpOptions)
      .pipe(
        tap(_ => console.log('fetched getOrderCountDetails')),
        catchError(this.handleError<OrderCount[]>('getOrderCountDetails', []))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }


}