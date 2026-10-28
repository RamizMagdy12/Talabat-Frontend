import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    accountService = inject(AccountService);
    router = inject(Router);
    i18n = inject(I18nService);
    showPassword = false;
    resending = false;

    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', Validators.required)
    });

    onSubmit() {
        if (this.loginForm.invalid) return;

        this.accountService.login(this.loginForm.value).subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: this.i18n.t('login.msg.success'),
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                this.router.navigateByUrl('/products');
            },
            error: (error) => {
                const apiMessage = error?.error?.message as string | undefined;
                if (apiMessage === 'EmailNotConfirmed') {
                    Swal.fire({
                        icon: 'warning',
                        title: this.i18n.t('login.msg.notActivatedTitle'),
                        text: this.i18n.t('login.msg.notActivatedText'),
                        showCancelButton: true,
                        confirmButtonText: this.i18n.t('login.msg.resend'),
                        cancelButtonText: this.i18n.t('common.ok')
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.resendActivation();
                        }
                    });
                    return;
                }

                Swal.fire({
                    icon: 'error',
                    title: this.i18n.t('login.msg.failed'),
                    text: this.i18n.t('login.msg.invalid')
                });
            }
        });
    }

    resendActivation() {
        const email = this.loginForm.value.email;
        if (!email || this.resending) return;

        this.resending = true;
        this.accountService.resendConfirmation(email).subscribe({
            next: () => {
                this.resending = false;
                Swal.fire({
                    icon: 'success',
                    title: this.i18n.t('login.msg.resendSentTitle'),
                    text: this.i18n.t('login.msg.resendSentText'),
                    confirmButtonText: this.i18n.t('common.ok')
                });
            },
            error: () => {
                this.resending = false;
                Swal.fire({
                    icon: 'error',
                    title: this.i18n.t('login.msg.resendFailedTitle'),
                    text: this.i18n.t('login.msg.resendFailedText'),
                    confirmButtonText: this.i18n.t('common.ok')
                });
            }
        });
    }
}
