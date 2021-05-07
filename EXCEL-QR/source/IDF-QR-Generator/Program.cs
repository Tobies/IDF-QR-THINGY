using System;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;
using System.Drawing;
using System.Drawing.Printing;

namespace IDF_QR_Generator
{
    class Program
    {

        static void Main(string[] args)
        {

            String[] extentions = { ".xlsx", ".xlsm", ".xlsb", ".xltx", ".xltm", ".xls", ".xlt", ".xml", ".xlam", ".xla", ".xlw", ".xlr", ".prn", ".txt", ".csv", ".dif", ".slk", ".dbf", ".ods", ".pdf", ".xps", ".wmf", ".emf", ".rtf" };

            var taskTime = System.Diagnostics.Stopwatch.StartNew();


            if (args.Length == 0)
            {
                Console.WriteLine("Wrong usage! Please drag an EXCEL file on this executable.");
                Console.ReadLine();
                return;
            }
            bool valid = false;
            foreach (String ext in extentions)
            {
                if (args[0].Contains(ext))
                {
                    valid = true;
                    break;
                }
            }

            if(!valid)
            {
                Console.WriteLine("Wrong usage! Please drag an EXCEL file on this executable.");
                Console.ReadLine();
                return;
            }

            Excel.Application app = new Excel.Application();
            Excel.Workbook workbook = app.Workbooks.Open(args[0]);
            Excel._Worksheet worksheet = workbook.Sheets[1];
            Excel.Range range = worksheet.UsedRange;


            Console.WriteLine("Initiating EXCEL...");

            String output = String.Empty;

            for (int i = 2; i <= range.Rows.Count; i++)
            {
                    if(range.Cells[i,5] != null && range.Cells[i,5].Value2 != null && range.Cells[i, 8] != null && range.Cells[i, 8].Value2 != null)
                    {

                        output += range.Cells[i,5].Value2.ToString() + "$" + range.Cells[i, 8].Value2.ToString() + "&";

                    }
            }

            output = output.Remove(output.Length - 1, 1);

            Console.WriteLine("Finished parsing data.");

            GC.Collect();
            GC.WaitForPendingFinalizers();
            Marshal.ReleaseComObject(range);
            Marshal.ReleaseComObject(worksheet);
            workbook.Close();
            Marshal.ReleaseComObject(workbook);
            app.Quit();
            Marshal.ReleaseComObject(app);

            Console.WriteLine("Cleaning up...");

            QRCodeGenerator QRGen = new QRCodeGenerator();
            QRCodeData QRData = QRGen.CreateQrCode("https://tobies.github.io/IDF-QR-THINGY/index.html#data=" + output, QRCodeGenerator.ECCLevel.H);
            QRCode QRCode = new QRCode(QRData);
            Bitmap QRBitmap = QRCode.GetGraphic(9);
            QRGen.Dispose();
            QRData.Dispose();
            QRCode.Dispose();

            Console.WriteLine("Generating QR-Code.");

            PrintDocument document = new PrintDocument();
            document.PrintPage += (thesender, ev) =>
            {
                ev.Graphics.DrawImage(QRBitmap, new PointF(ev.MarginBounds.Left, ev.MarginBounds.Top));
            };

            Console.WriteLine("Attempting to print document...");
            try
            {
                document.Print();
                Console.WriteLine("Printed document successfully!");
            } catch (Exception err)
            {
                Console.WriteLine("Failed to print document!\n" + err.Message);
            }
            
            QRBitmap.Dispose();
            document.Dispose();
            taskTime.Stop();
            var ms = taskTime.ElapsedMilliseconds;

            Console.WriteLine("Operation has been completed in " + ms + " miliseconds.");
            Console.ReadLine();
          

        }
    }
}
