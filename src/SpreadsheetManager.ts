import * as exceljs from 'exceljs';
import { ProcessedPullRequest } from './PullRequestsProcessor';

export default class SpreadsheetManager {
  private static MULTI_ROW_HEADERS = ['Sprint', 'US/BUG', 'Owner'];
  private static CENTERED_HEADERS = ['Sprint', 'US/BUG', 'Type of component', 'Created/Modified/Deleted', 'Owner'];
  private static COLUMNS = [
    { header: 'Sprint', key: 'sprint', width: 10 },
    { header: 'Path', key: 'path', width: 100 },
    { header: 'US/BUG', key: 'usBug', width: 20 },
    { header: 'Type of component', key: 'typeOfComponent', width: 20 },
    { header: 'Created/Modified/Deleted', key: 'createdModifiedDeleted', width: 30 },
    { header: 'Owner', key: 'owner', width: 20 },
  ];

  public static generateXlsx(prs: ProcessedPullRequest[], outputFilePath: string): void {
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');
    worksheet.columns = this.COLUMNS;
    this.outlineHeaders(worksheet, 'thick');

    for(const pr of prs) {
      const n = this.addTaskRows(worksheet, pr);
      this.mergeLastRows(worksheet, this.MULTI_ROW_HEADERS, n);
      this.outlineLastRowsPerimeter(worksheet, 'thick', n);
    }

    this.centerEveryCell(worksheet, this.CENTERED_HEADERS);
    this.outlineEveryCell(worksheet, 'thin');

    workbook.xlsx.writeFile(outputFilePath);
  }

  private static outlineHeaders(worksheet: exceljs.Worksheet, style: exceljs.BorderStyle): void {
    for (let c = 1; c <= worksheet.columnCount; c++) {
      const border = (worksheet.getCell(1, c).border ??= {});

      (border.top ??= {}).style = style;
      (border.left ??= {}).style = style;
      (border.right ??= {}).style = style;
      (border.bottom ??= {}).style = style;
    }
  }

  private static addTaskRows(worksheet: exceljs.Worksheet, pr: ProcessedPullRequest): number {
    for(const { path, createdModifiedDeleted, componentType } of pr.changes) {
      const row = worksheet.addRow({
        id: worksheet.rowCount,
        sprint: pr.sprint,
        path: path,
        usBug: `${pr.taskType} ${pr.taskNumber}`,
        typeOfComponent: componentType,
        createdModifiedDeleted: createdModifiedDeleted,
        owner: pr.owner,
      });

      row.getCell('usBug').value = {
        hyperlink: `https://dev.azure.com/accenturecio20/SELL_PR1011/_workitems/edit/${pr.taskNumber}`,
        text: `${pr.taskType} ${pr.taskNumber}`,
      };
    }

    return pr.changes.length;
  }

  private static mergeLastRows(worksheet: exceljs.Worksheet, targetHeaders: string[], n: number): void {
    for (let c = 1; c <= worksheet.columnCount; c++) {
      const header = worksheet.columns[c - 1].header as string;
      if(!targetHeaders.includes(header)) continue;

      worksheet.mergeCells(worksheet.rowCount - n + 1, c, worksheet.rowCount, c);
    }
  }

  private static outlineLastRowsPerimeter(worksheet: exceljs.Worksheet, style: exceljs.BorderStyle, n: number): void {
    for (let r = worksheet.rowCount - n + 1; r <= worksheet.rowCount; r++) {
      for (let c = 1; c <= worksheet.columnCount; c++) {
        const border = (worksheet.getCell(r, c).border ??= {});

        if(r === worksheet.rowCount - n + 1)
          (border.top ??= {}).style ||= style;
        if(c === 1)
          (border.left ??= {}).style ||= style;
        if(c === worksheet.columnCount)
          (border.right ??= {}).style ||= style;
        if(r === worksheet.rowCount)
          (border.bottom ??= {}).style ||= style;
      }
    }
  }

  private static centerEveryCell(worksheet: exceljs.Worksheet, targetHeaders: string[]): void {
    for(let r = 1; r <= worksheet.rowCount; r++) {
      for(let c = 1; c <= worksheet.columnCount; c++) {
        const header = worksheet.columns[c - 1].header as string;
        if(r !== 1 && !targetHeaders.includes(header)) continue;

        const alignment = (worksheet.getCell(r, c).alignment ??= {});
        alignment.horizontal = 'center';
        alignment.vertical = 'middle';
      }
    }
  }

  public static outlineEveryCell(worksheet: exceljs.Worksheet, style: exceljs.BorderStyle): void {
    for (let r = 1; r <= worksheet.rowCount; r++) {
      for (let c = 1; c <= worksheet.columnCount; c++) {
        const border = (worksheet.getCell(r, c).border ??= {});
        (border.top ??= {}).style ||= style;
        (border.left ??= {}).style ||= style;
        (border.right ??= {}).style ||= style;
        (border.bottom ??= {}).style ||= style;
      }
    }
  }
}
