import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../account.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-confirm-email',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './confirm-email.component.html',
    styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private accountService = inject(AccountService);
    private i18n = inject(I18nService);

    loading = true;
    succeeded = false;
    messageKey = 'confirmEmail.processing';

    ngOnInit(): void {
        const userId = this.route.snapshot.queryParamMap.get('userId');
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!userId || !token) {
            this.loading = false;
            this.succeeded = false;
            this.messageKey = 'confirmEmail.invalidLink';
            return;
        }

        this.accountService.confirmEmail(userId, token).subscribe({
            next: () => {
                this.loading = false;
                this.succeeded = true;
                this.messageKey = 'confirmEmail.success';
                Swal.fire({
                    icon: 'success',
                    title: this.i18n.t('confirmEmail.successTitle'),
                    text: this.i18n.t('confirmEmail.success'),
                    confirmButtonText: this.i18n.t('confirmEmail.goLogin')
                }).then(() => this.router.navigateByUrl('/account/login'));
            },
            error: (err) => {
                this.loading = false;
                this.succeeded = false;
                this.messageKey = 'confirmEmail.failed';
                Swal.fire({
                    icon: 'error',
                    title: this.i18n.t('confirmEmail.failedTitle'),
                    text: err.error?.message || this.i18n.t('confirmEmail.failed'),
                    confirmButtonText: this.i18n.t('common.ok')
                });
            }
        });
    }
}
