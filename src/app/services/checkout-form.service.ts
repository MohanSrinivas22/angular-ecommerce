import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators'
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private countriesUrl =  environment.backendUrl + "/countries";
  private statesUrl = environment.backendUrl + "/states";

  constructor(private httpClient: HttpClient) { }

  getCountries(): Observable<Country[]>{

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]>{

    const searchStatesUrl: string = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    return this.httpClient.get<GetResponseStates>(searchStatesUrl).pipe(
      map(response => response._embedded.states)
    );
  }

  getCreditCardMonths(startMonth: number): Observable<number[]>{
    let data:number[] = [];

    // build an array for Months dropdown list.
    // start at current month and loop until

    for(let theMonth = startMonth; theMonth <= 12; theMonth++){
      data.push(theMonth);
    }

    // use 'of' to wrap the data as observable.
    return of(data);
  }

  getCreditCardYears(): Observable<number[]>{
    let data:number[] = [];

    // build an array for "Year" dropdown list.
    // start at current Year and loop until

    let currentYear: number = new Date().getFullYear();
    let endYear: number = currentYear + 10;

    for(let theYear = currentYear; theYear <= endYear; theYear++){
      data.push(theYear);
    }

    // use 'of' to wrap the data as observable.
    return of(data);
  }
}

interface GetResponseCountries{
  _embedded:{
    countries: Country[];
  }
}

interface GetResponseStates{
  _embedded:{
    states: State[];
  }
}
