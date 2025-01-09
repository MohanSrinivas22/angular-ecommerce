import { Component, OnInit } from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';

@Component({
  selector: 'app-order-history',
  standalone: false,
  
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent implements OnInit{

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService){}

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    //read the email from browser's storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    // retrieve the data feom the service
    this.orderHistoryService.getOrderHistory(theEmail).subscribe(
      data => {
        this.orderHistoryList = data._embedded.orders;
      }
    );
    

  }

}
