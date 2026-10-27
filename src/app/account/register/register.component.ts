import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, RouterModule } from '@angular/router';
import { map, finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    accountService = inject(AccountService);
    router = inject(Router);
    i18n = inject(I18nService);
    showPassword = false;

    registerForm = new FormGroup({
        displayName: new FormControl('', Validators.required),
        userName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email], [this.validateEmailNotTaken()]),
        phoneNumber: new FormControl('', Validators.required),
        password: new FormControl('', [
            Validators.required,
            Validators.pattern(/(?=^.{6,10}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/)
        ])
    });

    onSubmit() {
        if (this.registerForm.invalid) return;

        this.accountService.register(this.registerForm.value).subscribe({
            next: () => {
                Swal.fire({
                    icon: 'success',
                    title: this.i18n.t('register.msg.success'),
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                this.router.navigateByUrl('/products');
            },
           error: (error) => {
    console.log('Full error:', error); // ✅ شوف الـ console
    console.log('Errors:', error.error?.errors);
    
    Swal.fire({
        icon: 'error',
        title: this.i18n.t('register.msg.failed'),
        text: error.error?.errors?.join(', ') || error.error?.message || this.i18n.t('common.error')
    });
}
        });
    }

    validateEmailNotTaken(): AsyncValidatorFn {
        return (control: AbstractControl) => {
            return this.accountService.checkEmailExists(control.value).pipe(
                map(result => result ? { emailExists: true } : null),
                finalize(() => control.markAsTouched())
            );
        }
    }
}
