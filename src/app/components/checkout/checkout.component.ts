import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormService } from '../../services/checkout-form.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { EcommerceValidators } from '../../common/ecommerce-validators';
import { CartServiceService } from '../../services/cart-service.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';

@Component({
  selector: 'app-checkout',
  standalone: false,
  
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit{

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
              private cartService: CartServiceService,
              private checkoutService: CheckoutService,
              private router: Router
            ){}
  
  ngOnInit(): void {

    // read the user's email address from the browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required])
      }),

      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required])
      }),

      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(3), EcommerceValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: new FormControl('', [Validators.required]),
        expirationYear: new FormControl('', [Validators.required])
      }),


    });

    // populate the totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => {
        this.totalQuantity = data;
        console.log(`Checkout - Total Quantity: ${this.totalQuantity}`);
      }
    );

    // populate the totalPrice
    this.cartService.totalPrice.subscribe(
      data =>{
        this.totalPrice = data;
        console.log(`Checkout - Total Price: ${this.totalPrice}`);
      }
    );

    // populate  credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log(`start month: ${startMonth}`);
    this.handleCreditCardMonths(startMonth);
  
    // populate  credit card years
    this.formService.getCreditCardYears().subscribe(
      data => {
        console.log(`Credit Card Years: ${JSON.stringify(data)}`);
        this.creditCardYears = data;
      }
    );

    // Populate the Countries
    this.formService.getCountries().subscribe(
      data => {
        console.log(`countries: ${this.countries}`);
        this.countries = data
      }
    );

  }

  // Customer Fields Validation
  get firstName(){ return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(){ return this.checkoutFormGroup.get('customer.lastName'); }
  get email(){ return this.checkoutFormGroup.get('customer.email'); }

  // Shipping Address Fields Validation
  get shippingAddressCountry(){ return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressState(){ return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCity(){ return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressStreet(){ return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressZipCode(){ return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  // Billing Address Fields Validation
  get billingAddressCountry(){ return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressState(){ return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCity(){ return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressStreet(){ return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressZipCode(){ return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  // Credit Card Fields Validation
  get cardType(){ return this.checkoutFormGroup.get('creditCard.cardType'); }
  get nameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get cardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get securityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode'); }
  get expirationMonth(){ return this.checkoutFormGroup.get('creditCard.expirationMonth'); }
  get expirationYear(){ return this.checkoutFormGroup.get('creditCard.expirationYear'); }

  handleMonthsAndYears() {
    const currentYear: number = new Date().getFullYear();

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const selectedYear: number = Number(creditCardFormGroup!.value.expirationYear);

    let startMonth: number = 1;

    if(selectedYear === currentYear){
      startMonth = Number(new Date().getMonth()) + 1;
    }

    this.handleCreditCardMonths(startMonth);

  }

  private handleCreditCardMonths(startMonth: number) {
    this.formService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log(`Credit Card Months: ${JSON.stringify(data)}`);
        this.creditCardMonths = data;
        this.checkoutFormGroup.get('creditCard')!.get('expirationMonth')!.setValue(data[0]);
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.formService.getStates(countryCode).subscribe(
      data => {
        console.log(`states: ${data.map(data => data.name)}`);
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        // select the first state as default.
        formGroup!.get('state')!.setValue(data[0]);
      }
    )

  }

  copyShippingToBillingAddress(event: any) {
    if(event.target.checked){
      this.billingAddressStates = this.shippingAddressStates;
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
    } else{
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }
    


  onSubmit() {
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched(); 
      return;
    }
    
    // set up order
    let order: Order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart items
    const cartItems = this.cartService.cartItems;  

    // create orderItems from cartItems
    // let orderItems: OrderItem[] = [];
    // for(let i = 0; i<cartItems.length; i++){
    //   orderItems[i] = new OrderItem(cartItems[i]);
    // }

    // (OR)

    let orderItems: OrderItem[] = cartItems.map(
      tempCartItem => new OrderItem(tempCartItem)
    );

    // set up purchase;
    let purchase: Purchase = new Purchase();
    
    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.state));
    const shippingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.country));
    purchase.shippingAddress!.state = shippingState.name;
    purchase.shippingAddress!.country = shippingCountry.name;
    
    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state));
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress?.country));
    purchase.billingAddress!.state = billingState.name;
    purchase.billingAddress!.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // Call the REST API via CheckoutService (POST request for purchase) and get the orderTrackingNumber
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been recieved. \n Order tracking number: ${response.orderTrackingNumber}`);
        // reset cart
        this.resetCart();

      },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    })

  }

  // After placing order successfully. Reset the cart.
  resetCart() {
    
    // Reset the Cart Data 
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();
  
    // Reset the form data
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }


}

