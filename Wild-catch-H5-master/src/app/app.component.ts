import { Component } from '@angular/core';
import { CoreBase } from '@infor-up/m3-odin';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.css']
})
export class AppComponent extends CoreBase {
   constructor() {
      super('AppComponent');
   }


}
