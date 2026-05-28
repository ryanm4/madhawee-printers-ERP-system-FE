import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import {
    formatCurrency,
    Currency,
} from "@/lib/currencyUtils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-utils";
import { companyData as mockCompanyData } from "@/modules/quotations/mockData";
import { QUOTATIONS, QuotationItems } from "@/modules/quotations/types";

const getSvgAsPngBytes = (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            const scale = 2; // High resolution
            canvas.width = img.naturalWidth * scale;
            canvas.height = img.naturalHeight * scale;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
            
            canvas.toBlob(async (blob) => {
                if (blob) {
                    resolve(await blob.arrayBuffer());
                } else {
                    reject(new Error("Failed to convert canvas to blob"));
                }
            }, "image/png");
        };
        img.onerror = () => reject(new Error("Failed to load SVG"));
        img.src = url;
    });
};

// Helper: Convert Hex to RGB (0-1 range)
const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? rgb(
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        )
        : rgb(0, 0, 0);
};

// Start of text wrapping helper
const wrapText = (text: string, width: number, font: PDFFont, fontSize: number): string[] => {
    // Normalize newlines and split into paragraphs
    const paragraphs = text.replace(/\r/g, '').split('\n');
    const result: string[] = [];

    for (const paragraph of paragraphs) {
        if (!paragraph) {
            // Empty line
            result.push("");
            continue;
        }
        const words = paragraph.split(' ');
        let line = '';

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const testWidth = font.widthOfTextAtSize(testLine, fontSize);
            if (testWidth > width && n > 0) {
                result.push(line);
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        result.push(line);
    }
    return result;
};

export const generateQuotationPDF = async (data: QUOTATIONS & { showAccountDetails?: boolean; items: QuotationItems[] }) => {
    try {
        const pdfDoc = await PDFDocument.create();
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // A4 Dimensions: 595.28 x 841.89 points
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();

        const colors = {
            primary: hexToRgb("#223F7A"),
            tableBody: hexToRgb("#EAECF2"), // Light gray/blue for body
            text: rgb(0, 0, 0),
            white: rgb(1, 1, 1),
        };

        // pdf-lib's default coordinate system has (0,0) at the bottom left.
        // So "Top" is `height`.
        // Let's implement a top-down cursor helper.

        const margin = 30;
        let yPosition = height - margin;

        // Move "Down" by subtracting from yPosition
        const moveDown = (amount: number) => {
            yPosition -= amount;
        };

        // Check for page break
        const checkPageBreak = (neededSpace: number) => {
            if (yPosition - neededSpace < margin) {
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                yPosition = height - margin;
                return newPage;
            }
            return pdfDoc.getPages()[pdfDoc.getPageCount() - 1]; // Return current page
        };

        // Construct company data from mock and imported assets, mapping to expected format
        const companyData = {
            company_logo: "/images/madhawee_logo.svg",
            company_address: mockCompanyData.address,
            company_email: mockCompanyData.email,
            company_website: mockCompanyData.website,
            company_phone: mockCompanyData.tel,
            payment_terms: mockCompanyData.terms,
            account_details: {
                account_number: mockCompanyData.bankDetails.accountNumber,
                bank_name: mockCompanyData.bankDetails.bankName,
                branch: mockCompanyData.bankDetails.branchName,
                account_holder_name: mockCompanyData.bankDetails.accountName,
                swift_code: "",
                iban: ""
            }
        };

        const currency = (data.currency || "LKR") as Currency;

        let currentPage = page;

        // --- LOGO ---
        if (companyData.company_logo) {
            try {
                const imageBytes = await getSvgAsPngBytes(companyData.company_logo);
                // Embed the generated PNG
                const image = await pdfDoc.embedPng(imageBytes);

                const logoDims = image.scaleToFit(200, 100);

                currentPage.drawImage(image, {
                    x: margin,
                    y: yPosition - logoDims.height,
                    width: logoDims.width,
                    height: logoDims.height,
                });

                moveDown(logoDims.height + 15);
            } catch (e) {
                console.error("Error embedding logo", e);
                moveDown(20);
            }
        } else {
            moveDown(20);
        }

        // --- COMPANY ADDRESS ---
        const fontSizeSmall = 9;
        if (companyData.company_address) {
            const addressLines = wrapText(companyData.company_address, 250, helvetica, fontSizeSmall);
            addressLines.forEach(line => {
                currentPage.drawText(line.trim(), { x: margin, y: yPosition, size: fontSizeSmall, font: helvetica, color: colors.text });
                moveDown(12);
            });
        }

        // --- CONTACT INFO ---
        const formatPhone = (phone?: string) => {
            if (!phone) return "";
            const digits = phone.replace(/\D/g, "");
            if (digits.length < 7) return phone;
            const countryCode = digits.slice(0, 2);
            const part1 = digits.slice(2, 5);
            const part2 = digits.slice(5);
            return `+${countryCode} ${part1} ${part2}`;
        };

        // Mock data phone is already formatted, so use directly or format if needed. 
        // Mock: "011-2824984 / 011-2824985" -> formatPhone won't handle multiple numbers nicely with this logic string slice logic.
        // So we assume mock data is display-ready or use as is.
        // The previous logic used `formatPhone(data)`.
        // Since we control mock data, let's use it as is for simplicity, or just apply format if single number.
        // Given the string "011-...", formatPhone logic `slice(0,2)` logic implies formatting simple numbers.
        // I'll skip formatting for the hardcoded mock phone string to avoid breaking it.

        const contactText = [
            companyData.company_email,
            companyData.company_website,
            companyData.company_phone
        ].filter(Boolean).join(" | ");

        if (contactText) {
            currentPage.drawText(contactText, { x: margin, y: yPosition, size: fontSizeSmall, font: helvetica, color: colors.text });
            moveDown(12);
        }

        moveDown(40);

        // --- TITLE & INFO COLUMNS ---
        // Align QUOTATION with TO
        const leftColX = margin;
        const rightColX = 350;

        // Store Y before writing columns
        const sectionTopY = yPosition;

        // LEFT: QUOTATION Title + Details
        const titleSize = 24;
        currentPage.drawText("QUOTATION", {
            x: leftColX,
            y: sectionTopY,
            size: titleSize,
            font: helvetica,
            color: colors.primary
        });

        let leftY = sectionTopY - 30; // Start details below title
        const labelSize = 10;
        const infoLineHeight = 15;

        const formattedDate = (dateStr?: string) => {
            if (!dateStr) return "N/A";
            return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
        };

        const leftSpacing = 22;
        currentPage.drawText(`Quote No : ${data.quote_id}`, { x: leftColX, y: leftY, size: labelSize, font: helveticaBold });
        leftY -= leftSpacing;
        currentPage.drawText(`Date : ${formattedDate(data.created_on)}`, { x: leftColX, y: leftY, size: labelSize, font: helvetica });
        leftY -= leftSpacing;
        const validity = data.delivery_days || 7;
        currentPage.drawText(`Validity Period : ${validity} Days`, { x: leftColX, y: leftY, size: labelSize, font: helvetica });
        leftY -= leftSpacing;
        if (data.marketing_person) {
            currentPage.drawText(`Marketing : ${data.marketing_person}`, { x: leftColX, y: leftY, size: labelSize, font: helvetica });
            leftY -= leftSpacing;
        }


        // RIGHT: TO + Customer Details
        let rightY = sectionTopY;

        // data.customer might be ID or name depending on usage. Assuming Name based on previous code.
        const customerName = data.company_name || "";
        currentPage.drawText(`TO : ${customerName}`, { x: rightColX, y: rightY, size: labelSize, font: helveticaBold });
        rightY -= leftSpacing;

        // Customer Detail
        if (data.contact_person) {
            currentPage.drawText(data.contact_person, { x: rightColX, y: rightY, size: labelSize, font: helvetica });
            rightY -= infoLineHeight;
        }

        if (data.customer_address) {
            const addressLines = wrapText(data.customer_address, 215, helvetica, labelSize);
            addressLines.forEach(line => {
                currentPage.drawText(line.trim(), { x: rightColX, y: rightY, size: labelSize, font: helvetica });
                rightY -= infoLineHeight;
            });
        }

        if (data.customer_phone) {
            currentPage.drawText(data.customer_phone, { x: rightColX, y: rightY, size: labelSize, font: helvetica });
            rightY -= infoLineHeight;
        }

        if (data.customer_email) {
            currentPage.drawText(data.customer_email, { x: rightColX, y: rightY, size: labelSize, font: helvetica });
            rightY -= infoLineHeight;
        }

        // Sync Y
        yPosition = Math.min(leftY, rightY) - 20;

        // --- TABLE GENERATION ---
        // Columns: #, Product, Qty, Price, Total, VAT, Total(Inc)
        // tax_type_id mapping: 0: VAT, 1: TIEP, 2: NONE
        const isTaxNone = Number(data?.tax_type_id) === 2;

        let colWidths = [30, 175, 50, 80, 80, 60, 80];
        let colAlign: ('center' | 'left' | 'right')[] = ['center', 'left', 'right', 'right', 'right', 'right', 'right'];
        let headers = [
            "#",
            "Product",
            "Qty",
            `Unit Price` + "\n" + `(${currency})`,
            `Total` + "\n" + "(EX)",
            `VAT` + "\n" + "(18%)",
            `Total` + "\n" + "(Inc)"
        ];

        if (isTaxNone) {
            // Remove Total(EX) and VAT(18%) columns if tax is None
            colWidths = [30, 245, 60, 100, 120];
            colAlign = ['center', 'left', 'right', 'right', 'right'];
            headers = [
                "#",
                "Product",
                "Qty",
                `Unit Price` + "\n" + `(${currency})`,
                `Total` + "\n" + "(Inc)"
            ];
        }

        const tableX = margin;
        const rowHeightBuffer = 10;
        const tableHeaderHeight = 35;

        // Draw Header
        currentPage = checkPageBreak(tableHeaderHeight);
        currentPage.drawRectangle({
            x: tableX,
            y: yPosition - tableHeaderHeight,
            width: colWidths.reduce((a, b) => a + b, 0),
            height: tableHeaderHeight,
            color: colors.primary,
        });

        let currentX = tableX;
        headers.forEach((header, i) => {
            const width = colWidths[i];
            const lines = header.split('\n');
            let startY = yPosition - (tableHeaderHeight / 2) + (lines.length > 1 ? 4 : -3);

            lines.forEach((line) => {
                const textWidth = helveticaBold.widthOfTextAtSize(line, 9);
                let textX = currentX + 5;
                if (colAlign[i] === 'center') textX = currentX + (width / 2) - (textWidth / 2);
                else if (colAlign[i] === 'right') textX = currentX + width - textWidth - 5;

                currentPage.drawText(line, {
                    x: textX,
                    y: startY,
                    size: 9,
                    font: helveticaBold,
                    color: colors.white
                });
                startY -= 10;
            });
            currentX += width;
        });

        moveDown(tableHeaderHeight);

        // Draw Rows
        const items = data.items || [];
        for (let i = 0; i < items.length; i++) {
            const p = items[i];
            const qty = Number(p.item_qty);
            const rate = Number(p.item_unit_price);
            const itemTotal = qty * rate;
            // tax_type_id mapping: 0: VAT, 1: TIEP, 2: NONE
            const vatAmount = (data?.tax_type_id === 0 || data?.tax_type_id === 1) ? itemTotal * 0.18 : 0;
            // If API returns IDs, we need logic. For now, assuming tax logic based on previous string check isn't directly compatible without lookup. 
            // However, usually detailed items might have tax info.
            // Let's stick to simple logic or 0 if unknown, or maybe 18% if tax_type suggests.
            // The user didn't specify strict tax logic for PDF update, just structure. 
            // Previous code: `data?.taxType === "vat"`. Interface: `tax_type_id: number`.
            // I'll leave a TODO or assumption. 
            // Actually, let's just calculate total based on itemTotal + VAT (if applicable).
            // For safety, I'll calculate standard 18% if tax_type_id is defined and > 0? Or just use what we have.
            // Reverting to basic calculation for display purposes.
            // If `tax_type_id` implies VAT, we add it. Let's assume `tax_type_id` 1 is VAT.

            const totalWithVat = itemTotal + vatAmount;

            let rowData = [
                (i + 1).toString(),
                p.item_description || p.item_category || "-",
                qty.toString(),
                formatCurrency(rate, currency),
                formatCurrency(itemTotal, currency),
                formatCurrency(vatAmount, currency),
                formatCurrency(totalWithVat, currency)
            ];

            if (isTaxNone) {
                rowData = [
                    (i + 1).toString(),
                    p.item_description || p.item_category || "-",
                    qty.toString(),
                    formatCurrency(rate, currency),
                    formatCurrency(totalWithVat, currency)
                ];
            }

            const productLines = wrapText(rowData[1], colWidths[1] - 10, helvetica, 9);
            const rowHeight = Math.max(20, productLines.length * 12 + rowHeightBuffer);

            currentPage = checkPageBreak(rowHeight);

            // Draw Background
            currentPage.drawRectangle({
                x: tableX,
                y: yPosition - rowHeight,
                width: colWidths.reduce((a, b) => a + b, 0),
                height: rowHeight,
                color: colors.tableBody
            });

            // Draw Cells
            let cellX = tableX;
            rowData.forEach((text, colIndex) => {
                const width = colWidths[colIndex];

                if (colIndex === 1) {
                    let lineY = yPosition - 12;
                    productLines.forEach(line => {
                        currentPage.drawText(line.trim(), { x: cellX + 5, y: lineY, size: 9, font: helvetica, color: colors.text });
                        lineY -= 12;
                    });
                } else {
                    const textWidth = helvetica.widthOfTextAtSize(text, 9);
                    let textX = cellX + 5;
                    if (colAlign[colIndex] === 'center') textX = cellX + (width / 2) - (textWidth / 2);
                    else if (colAlign[colIndex] === 'right') textX = cellX + width - textWidth - 5;

                    currentPage.drawText(text, {
                        x: textX,
                        y: yPosition - (rowHeight / 2) - 3,
                        size: 9,
                        font: helvetica,
                        color: colors.text
                    });
                }
                cellX += width;
            });

            moveDown(rowHeight + 2);
            yPosition += 2;
        }

        // --- SUMMARY SECTION ---
        moveDown(20);
        const summaryWidth = 200;
        const summaryX = width - margin - summaryWidth;
        const valueX = width - margin;
        const summaryFontSize = 10;

        const subtotalVal = parseFloat(data.sub_total || "0");
        const netTotalVal = parseFloat(data.net_total || "0");
        const taxAmount = netTotalVal - subtotalVal;

        const totalDiscount = (data.items || []).reduce((acc: number, item: QuotationItems) =>
            acc + (parseFloat(item.item_qty || "0") * parseFloat(item.item_unit_discount || "0")), 0
        );

        const summaryLines = isTaxNone ? [
            { label: "Subtotal :", value: formatCurrency(subtotalVal, currency) },
            { label: "No. of Items :", value: data.no_of_items || "0" },
            { label: "TOTAL :", value: formatCurrency(netTotalVal, currency), highlight: true },
        ] : [
            { label: "Subtotal :", value: formatCurrency(subtotalVal, currency) },
            { label: `Tax (18%) :`, value: formatCurrency(taxAmount, currency) },
            { label: "Discount :", value: formatCurrency(totalDiscount, currency) },
            { label: "TOTAL :", value: formatCurrency(netTotalVal, currency), highlight: true },
        ];

        summaryLines.forEach(line => {
            currentPage = checkPageBreak(25);

            // Removed highlight background as requested

            currentPage.drawText(line.label, {
                x: summaryX,
                y: yPosition - 10,
                size: line.highlight ? summaryFontSize + 2 : summaryFontSize,
                font: line.highlight ? helveticaBold : helvetica,
                color: colors.text,
            });

            const currentFont = line.highlight ? helveticaBold : helvetica;
            const currentSize = line.highlight ? summaryFontSize + 2 : summaryFontSize;
            const textWidth = currentFont.widthOfTextAtSize(line.value, currentSize);

            currentPage.drawText(line.value, {
                x: valueX - textWidth,
                y: yPosition - 10,
                size: currentSize,
                font: currentFont,
                color: colors.text,
            });

            moveDown(25);
        });

        moveDown(20);

        // --- TERMS & CONDITIONS ---
        if (companyData.payment_terms) {
            currentPage = checkPageBreak(50);
            currentPage.drawText("Terms and Conditions", { x: margin, y: yPosition, size: 12, font: helveticaBold, color: colors.primary });
            moveDown(15);

            const termsText = companyData.payment_terms;
            const lines = termsText.split('\n').filter((l: string) => l.trim().length > 0);

            lines.forEach((line: string, index: number) => {
                const match = line.match(/^(\d+[\.\)])\s*(.+)/);
                const prefix = match ? match[1] : `${index + 1}.`;
                const body = match ? match[2] : line.trim();

                const fullPrefix = `${prefix} `;
                const prefixWidth = Math.max(helvetica.widthOfTextAtSize(fullPrefix, 9), 20);
                const indentX = margin + prefixWidth;
                const availableWidth = width - margin - indentX;
                const bodyLines = wrapText(body, availableWidth, helvetica, 9);

                const requiredHeight = bodyLines.length * 12;
                currentPage = checkPageBreak(requiredHeight);

                currentPage.drawText(fullPrefix, { x: margin, y: yPosition, size: 9, font: helvetica, color: colors.text });

                bodyLines.forEach((bLine, i) => {
                    if (i > 0) moveDown(12);
                    currentPage.drawText(bLine.trim(), { x: indentX, y: yPosition, size: 9, font: helvetica, color: colors.text });
                });

                moveDown(12);
                moveDown(5);
            });
        }

        moveDown(10);

        // --- ACCOUNT DETAILS ---
        if (data?.showAccountDetails && companyData.account_details) {
            currentPage = checkPageBreak(100);
            currentPage.drawText("Account Details", { x: margin, y: yPosition, size: 12, font: helveticaBold, color: colors.primary });
            moveDown(15);

            const details = [
                { label: "Account Number", val: companyData.account_details.account_number },
                { label: "Bank Name", val: companyData.account_details.bank_name },
                { label: "Branch Name", val: companyData.account_details.branch },
                { label: "Account Holder Name", val: companyData.account_details.account_holder_name },
                { label: "SWIFT Code", val: companyData.account_details.swift_code },
                { label: "IBAN", val: companyData.account_details.iban },
            ];

            details.forEach(det => {
                if (det.val) {
                    currentPage = checkPageBreak(12);
                    currentPage.drawText(`${det.label}: ${det.val}`, { x: margin, y: yPosition, size: 9, font: helvetica, color: colors.text });
                    moveDown(12);
                }
            });
        }

        // Serialize and save
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${customerName ? customerName : (data.quote_id || "quotation")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error(getErrorMessage(error, "Failed to generate PDF. Please check the console for details."));
    }
};
