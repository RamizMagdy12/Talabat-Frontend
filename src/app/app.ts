import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BasketService } from './core/services/basket.service';
import { AccountService } from './account/account.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('TalabatAngular');
  readonly currentYear = new Date().getFullYear();
  isAuthRoute = false;
  menuOpen = false;

  constructor(
    public basketService: BasketService,
    public accountService: AccountService,
    private router: Router
  ) {
    this.loadCurrentUser();
    this.isAuthRoute = this.router.url.startsWith('/account');
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.isAuthRoute = e.urlAfterRedirects.startsWith('/account');
        this.menuOpen = false;
      });
  }

  ngOnInit(): void {
    const basketId = localStorage.getItem('basket_id');
    if (basketId) {
      this.basketService.getBasket(basketId).subscribe({
        next: () => console.log('initialized basket'),
        error: error => console.log(error)
      });
    }
  }

  loadCurrentUser() {
    const token = localStorage.getItem('token');

    this.accountService.loadCurrentUser(token).subscribe({
      next: () => console.log('loaded user'),
      error: (error: unknown) => console.log(error)
    });
  }

  logout() {
    this.accountService.logout();
  }
}
