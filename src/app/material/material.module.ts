import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {  MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatIcon,
    MatIconModule,
    MatInputModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule

  ],
  exports: [
    MatInputModule,
    MatIcon,
    MatIconModule, 
    MatDialogModule,  
    MatSelectModule,
    MatFormFieldModule
  ]
})
export class MaterialModule { }
