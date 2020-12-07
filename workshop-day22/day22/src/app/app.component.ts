import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { OrderService } from './order.service';
import { OrderCount } from './order.count';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'day22';
  orderCount: OrderCount;
  
  constructor(private ordSvc: OrderService) {

  }

  ngOnInit(): void {

  }

  searchForm = new FormGroup({
    orderId: new FormControl("", Validators.required)
  });

  searchOrder(){
    let orderId = this.searchForm.get("orderId").value;
    console.log(orderId);
    this.ordSvc.getOrderCountDetails(orderId)
      .subscribe(results => this.orderCount = results[0]);
  }
}
