// Componentes
import { Component, OnInit, ViewChild } from "@angular/core";
import { APIENDPOINT, MESSAGES, FILENAME } from "../../../config/configuration";
import { Router } from "@angular/router";

// Modelos
import * as _ from "underscore";

// Servicios
import { ToastrService } from "ngx-toastr";

import {
  Validators,
  FormControl,
  FormGroup,
  FormBuilder,
} from "@angular/forms";

import { MudanzaService } from "app/shared/services/mudanzas/mudanza.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "create-mudanza",
  templateUrl: "create-mudanza.component.html",
  providers: [MudanzaService],
})
export class CreateMudanzaComponent implements OnInit {
  isLoaded = false;
  form: FormGroup;
  uploadedFiles: any[] = [];
  showSpinner: boolean = false;
  fileUrl;
  contentDownloadFile: string = "";
  fileName = FILENAME.dowloadFileName;

  @ViewChild("fileUpload") fileUpload: any;
  @ViewChild("urlFileDownload") set userContent(element) {
    if (element) {
      // here you get access only when element is rendered (or destroyed)
      document.getElementById("downloadFile").click();
    }
  }

  constructor(
    private fb: FormBuilder,
    private _mudanzaService: MudanzaService,
    private _toastrService: ToastrService,
    private _router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      documentCard: new FormControl("", Validators.required),
      file: new FormControl("", Validators.required),
    });
  }

  onUpload(event) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  myUploader(event): void {
    if (event.files.length == 0) {
      return;
    }

    if (this.form.controls["documentCard"].value === "") {
      this._toastrService.warning(MESSAGES.validationMessage, "");
      return;
    }

    this.showSpinner = true;
    var fileToUpload = event.files[0];

    let input = new FormData();
    input.append("file", fileToUpload);
    input.append("id", this.form.controls["documentCard"].value);
    console.log(this.uploadedFiles);
    this.showSpinner = true;

    this._mudanzaService
      .create(APIENDPOINT.uploadFile, input)
      .subscribe((response) => {
        if (response.header.reponseCode === 200) {
          // this._router.navigate([`/mudanza/list`]);

          this.downloadFile(response.data)
          this.showSpinner = false;
        } else {
          this._toastrService.error(response.header.message, "");
          this.isLoaded = true;
          this.showSpinner = false;
        }
        this.showSpinner = false;
      });
  }

  downloadFile(listWorkinDays: string[]) {
    for (let index = 0; index < listWorkinDays.length; index++) {
      this.contentDownloadFile += listWorkinDays[index] + "\n";
    }

    if (this.contentDownloadFile != "") {
      const blob = new Blob([this.contentDownloadFile], {
        type: "application/octet-stream",
      });

      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        window.URL.createObjectURL(blob)
      );

      this.clearFields();
      this._toastrService.success(MESSAGES.successMessage, "");
    }
  }

  clearFields() {
    this.form.controls["documentCard"].setValue("");
    this.fileUpload.clear();
  }
}
