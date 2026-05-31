import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { map } from 'rxjs';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const router = inject(Router);

    return accountService.currentUser$.pipe(
        map(user => {
            if (user) return true;

            Swal.fire({
                icon: 'warning',
                title: 'Unauthenticated',
                text: 'You must log in first before accessing the basket.',
                confirmButtonText: 'Go to Login',
                showCancelButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
                }
            });

            return false;
        })
    );
};
