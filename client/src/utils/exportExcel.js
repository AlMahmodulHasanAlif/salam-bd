// Dependency-free Excel export.
//
// Instead of pulling in SheetJS (which isn't reliably installable from the
// public npm registry and broke the production build), we build a small HTML
// worksheet that Excel opens natively — columns, headers, and Unicode (Bangla)
// all intact. The `mso-number-format:'\@'` forces every cell to TEXT so phone
// numbers / IDs keep their leading zeros instead of being mangled into numbers.

const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");

/**
 * @param {{header: string, value: (row: any) => any}[]} columns
 * @param {any[]} rows
 * @param {string} filenameBase  file name without extension
 */
export function exportToExcel(columns, rows, filenameBase) {
  const thead = `<tr>${columns
    .map(
      (c) =>
        `<th style="background:#0e7a4f;color:#ffffff;border:1px solid #cccccc;padding:6px 8px;text-align:left;white-space:nowrap">${esc(
          c.header,
        )}</th>`,
    )
    .join("")}</tr>`;

  const tbody = rows
    .map(
      (r) =>
        `<tr>${columns
          .map(
            (c) =>
              `<td style="border:1px solid #dddddd;padding:4px 8px;mso-number-format:'\\@'">${esc(
                c.value(r),
              )}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel" ` +
    `xmlns="http://www.w3.org/TR/REC-html40"><head>` +
    `<meta charset="UTF-8"></head><body>` +
    `<table border="1">${thead}${tbody}</table></body></html>`;

  // Leading BOM so Excel detects UTF-8 and renders Bangla correctly.
  const blob = new Blob(["﻿" + html], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
