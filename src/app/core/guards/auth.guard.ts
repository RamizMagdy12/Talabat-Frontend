import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const router = inject(Router);
    const token = localStorage.getItem('token');

    return accountService.loadCurrentUser(token).pipe(
        map(user => {
            if (user) return true;

            Swal.fire({
                icon: 'warning',
                title: 'Unauthenticated',
                text: 'You must log in first before accessing this page.',
                confirmButtonText: 'Go to Login',
                showCancelButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
                }
            });

            return false;
        }),
        catchError(() => {
            router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return of(false);
        })
    );
};
