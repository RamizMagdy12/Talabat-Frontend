import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { catchError, map, of } from 'rxjs';
import Swal from 'sweetalert2';
import { I18nService } from '../i18n/i18n.service';

export const authGuard: CanActivateFn = (route, state) => {
    const accountService = inject(AccountService);
    const router = inject(Router);
    const i18n = inject(I18nService);
    const token = localStorage.getItem('token');

    return accountService.loadCurrentUser(token).pipe(
        map(user => {
            if (user) return true;

            Swal.fire({
                icon: 'warning',
                title: i18n.t('auth.msg.unauthTitle'),
                text: i18n.t('auth.msg.unauthText'),
                confirmButtonText: i18n.t('auth.msg.goLogin'),
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
