import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  standalone: false,
  
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent implements OnInit{

  isAuthenticated: boolean = false;
  userFullName: string = '';

  storage: Storage =  sessionStorage;

  constructor ( private oktaAuthService: OktaAuthStateService,
                @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
   ){}

  ngOnInit(): void {
    // subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!;
        this.getUserDetails();
      }
    );
  }

  getUserDetails() {
    if(this.isAuthenticated){
      // Fetch the loggedin user details 
      // users full name is exposed as a property name
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name as string;

          // retrieve the user's email from the authentication response
          const theEmail = res.email;

          // now store the email in the browser's storage
          this.storage.setItem('userEmail',  JSON.stringify(theEmail));
        }
      );
    }
  }

  logout(){
    //Terminates the session with okta and removes the current tokens.
    this.oktaAuth.signOut();
  }
}
