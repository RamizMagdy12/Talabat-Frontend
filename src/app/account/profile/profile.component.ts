import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  accountService = inject(AccountService);
  isLoading = true;
  isSaving = false;
  isChangingPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  profileForm = new FormGroup({
    displayName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email: new FormControl({ value: '', disabled: true }),
    userName: new FormControl({ value: '', disabled: true }),
    phoneNumber: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    street: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl('')
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/)
    ]),
    confirmPassword: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          displayName: profile.displayName,
          email: profile.email,
          userName: profile.userName,
          phoneNumber: profile.phoneNumber || '',
          firstName: profile.address?.firstName || '',
          lastName: profile.address?.lastName || '',
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          country: profile.address?.country || ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Could not load profile',
          text: 'Please sign in again.'
        });
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid || this.isSaving) return;
    this.isSaving = true;

    const v = this.profileForm.getRawValue();
    this.accountService.updateProfile({
      displayName: v.displayName || '',
      phoneNumber: v.phoneNumber || null,
      address: {
        firstName: v.firstName || '',
        lastName: v.lastName || '',
        street: v.street || '',
        city: v.city || '',
        country: v.country || ''
      }
    }).subscribe({
      next: () => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Profile updated',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2200,
          timerProgressBar: true
        });
      },
      error: (err) => {
        this.isSaving = false;
        const msg =
          (Array.isArray(err?.error?.errors) ? err.error.errors.join(', ') : null) ||
          err?.error?.message ||
          err?.error?.Message ||
          'Please restart the API and try again.';
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: msg
        });
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid || this.isChangingPassword) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      Swal.fire({ icon: 'warning', title: 'Passwords do not match' });
      return;
    }

    this.isChangingPassword = true;
    this.accountService.changePassword(currentPassword!, newPassword!).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        Swal.fire({
          icon: 'success',
          title: 'Password changed',
          text: res?.message || 'Your password was updated.'
        });
      },
      error: (err) => {
        this.isChangingPassword = false;
        Swal.fire({
          icon: 'error',
          title: 'Could not change password',
          text: err?.error?.message || err?.error?.errors?.[0] || 'Check your current password and try again.'
        });
      }
    });
  }
}
