import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AccountService } from '../account.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  accountService = inject(AccountService);
  router = inject(Router);
  i18n = inject(I18nService);
  isSubmitting = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    this.accountService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: this.i18n.t('forgot.msg.inboxTitle'),
          text: this.i18n.t('forgot.msg.inboxText'),
          confirmButtonText: this.i18n.t('forgot.msg.backToLogin')
        }).then(() => this.router.navigateByUrl('/account/login'));
        this.form.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: this.i18n.t('forgot.msg.failedTitle'),
          text: err?.error?.message || err?.error?.Message || this.i18n.t('forgot.msg.failedText')
        });
      }
    });
  }
}
