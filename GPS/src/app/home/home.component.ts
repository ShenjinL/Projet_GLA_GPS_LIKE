import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  h1Style: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  firstClick() {
    this.h1Style = !this.h1Style;
  }
}
