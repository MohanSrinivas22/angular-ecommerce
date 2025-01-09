import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartServiceService {

  cartItems: CartItem[] = [];

  // Subject is a subclass of Observable. We can use Subject to publish events in our code.
  // The event will be sent to all of the subscribers.
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // Adding session storage for cart data persistance
  // sessionStorage lasts as long as session. i.e, untill the browser tab or window remains open.
  // storage: Storage = sessionStorage;
  // localStorage lasts as long as we dont clear the browser's cache.
  storage: Storage = localStorage;

  constructor() {
    // Read data from storage.
    // const tempData: any = this.storage.getItem('cartItems');
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if(data != null){
      this.cartItems = data;
      //Compute cart totals based on data that is read from storage.
      this.computeCartTotals();
    }

  }

  addToCart(theCartItem: CartItem) {
    // check if we already have the item in our cart.
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem;
    if (this.cartItems.length > 0) {
      // find the items in the cart based on item id.
      for (let tempCartItem of this.cartItems) {
        if (tempCartItem.id === theCartItem.id) {
          existingCartItem = tempCartItem;
          alreadyExistsInCart = true;
          break;
        }
      }
    }

    // existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id)!;

    if(alreadyExistsInCart){
      existingCartItem!.quantity ++;
    } else {
      this.cartItems.push(theCartItem);
    }

    this.computeCartTotals()
  }

  removeFromCart(theCartItem: CartItem) {
    // get the index of the cart item.
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id == theCartItem.id);

    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity === 0){
      this.removeFromCart(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.unitPrice * currentCartItem.quantity;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values to all subscribers, so that they get updated data.
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    // log cart data just for debugging.
    this.logCartData(totalPriceValue, totalQuantityValue);

    // persist the cart data.
    this.persistCartItems();
  }

  // add cartItems to the local session storage for persistance.
  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log(`Contents of the cart`);
    for(let tempCartItem of this.cartItems){
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`);
    }

    console.log(`totalPrice: ${totalPriceValue}, totalQuantity: ${totalQuantityValue}`);
    console.log(`--------------------`)
  }
}
