import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { ApiUrls } from '../../../core/constants/api-urls';
import { Register } from '../dto/register';
import { Login } from '../dto/login';
import { Storage } from '../../../core/constants/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Roles } from '../../../core/constants/roles';
import { ErrorService } from '../../../core/services/error.service';
import { BehaviorSubject,throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = ApiUrls.backend+ApiUrls.auth;
  private messageSource = new BehaviorSubject(0);
  currentMessage = this.messageSource.asObservable();

  constructor(public jwtHelper: JwtHelperService, private errorService: ErrorService,private httpClient: HttpClient,private router:Router) { }
  

  changeMessage() {
    this.messageSource.next(0);
  }

  public registerKorisnik(register: Register) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json' );
    return this.httpClient.post(this.API_URL+ApiUrls.register, register, { 'headers': headers })
    .pipe(catchError((error: Response) => {
      this.errorService.handleError(error);
      return throwError(error);
  }));
  }

  public loginKorisnik(login: Login) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json' );
    return this.httpClient.post(this.API_URL+ApiUrls.login, login, { 'headers': headers })
    .pipe(catchError((error: Response) => {
      this.errorService.handleError(error);
      return throwError(error);
  }));
  }

  isLoggedIn():boolean {
    var token=localStorage.getItem(Storage.token);
    if(token===null || this.jwtHelper.isTokenExpired(token)) return false;
    else return true;
  }

  getRole():string{
    var token=localStorage.getItem(Storage.token);
    if(token==null){
      return Roles.guest;
    }
    if(this.jwtHelper.isTokenExpired(token))
    {
      this.logOut();
      return Roles.guest;
    }
    return this.jwtHelper.decodeToken(token).role;
  }

  public logOut():void{
    localStorage.clear();
    this.router.navigateByUrl('/');
  }
}