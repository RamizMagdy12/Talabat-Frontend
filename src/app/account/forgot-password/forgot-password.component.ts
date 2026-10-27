import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  accountService = inject(AccountService);
  router = inject(Router);
  isSubmitting = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    this.accountService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Check your inbox',
          text: res?.message || 'If an account exists for this email, a new password has been sent.',
          confirmButtonText: 'Back to login'
        }).then(() => this.router.navigateByUrl('/account/login'));
        this.form.reset();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Could not send email',
          text: err?.error?.message || err?.error?.Message || 'Please try again later.'
        });
      }
    });
  }
}
