import { prisma } from './src/utils/prisma';

const unlayerDesign = {
  "body": {
    "rows": [
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "image",
                "values": {
                  "src": {
                    "url": "https://www.fs-hirondelle.de/images/logo_bird_white.png",
                    "width": 50,
                    "height": "auto"
                  },
                  "padding": "10px",
                  "containerPadding": "0px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#3d8ebb",
              "padding": "0px"
            }
          }
        ],
        "values": {
          "backgroundColor": "#3d8ebb",
          "padding": "0px",
          "columnsBackgroundColor": "#3d8ebb"
        }
      },
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "heading",
                "values": {
                  "headingType": "h2",
                  "text": "✉ NEWSLETTER",
                  "color": "#3d8ebb",
                  "textAlign": "left",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#f4f4f4"
            }
          }
        ],
        "values": {
          "backgroundColor": "#f4f4f4"
        }
      },
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "image",
                "values": {
                  "src": {
                    "url": "https://www.fs-hirondelle.de/images/logo_hirondelle.png"
                  },
                  "textAlign": "left",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 18px; color: #3d8ebb; font-weight: bold;\">Hallo {subtag:name|part:first|ucfirst},</p><p style=\"font-size: 16px; margin-top: 15px;\">Hier kommt der Hauptinhalt des Newsletters...</p>",
                  "padding": "20px",
                  "color": "#333333"
                }
              }
            ]
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"font-size: 16px; color: #3d8ebb; font-style: italic; font-weight: bold;\">Luftige Gr&uuml;&szlig;e<br>Team Hirondelle</p>",
                  "padding": "20px"
                }
              },
              {
                "type": "divider",
                "values": {
                  "width": "100%",
                  "border": {
                    "borderTopWidth": "1px",
                    "borderTopStyle": "solid",
                    "borderTopColor": "#cccccc"
                  }
                }
              },
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"text-align: center; font-size: 12px; font-weight: bold;\">Flugschule Hirondelle<br>Untergasse 27 - 69469 Weinheim | Am Birnbach 6 - 76829 Landau<br><br>Telefon: +49 (0) 6201 8452097<br><br><span style=\"color: #3d8ebb; font-size: 14px;\">Sparkasse SÜW<br>IBAN: DE32 5485 0010 1700 1976 41<br>BIC: SOLADES1SUW</span><br><br><a href=\"#\" style=\"color: #3d8ebb;\">Datenschutzerklärung</a></p>",
                  "padding": "20px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#ffffff"
            }
          }
        ],
        "values": {
          "backgroundColor": "#ffffff"
        }
      },
      {
        "cells": [1],
        "columns": [
          {
            "contents": [
              {
                "type": "text",
                "values": {
                  "text": "<p style=\"text-align: center; color: white;\">Kein Interesse mehr am Newsletter? {unsubscribe}Abmelden{/unsubscribe}</p>",
                  "padding": "15px"
                }
              }
            ],
            "values": {
              "backgroundColor": "#3d8ebb"
            }
          }
        ],
        "values": {
          "backgroundColor": "#3d8ebb"
        }
      }
    ],
    "values": {
      "backgroundColor": "#e6e6e6",
      "fontFamily": {
        "label": "Arial",
        "value": "arial,helvetica,sans-serif"
      }
    }
  }
};

const htmlContent = `
<div style="background-color: #e6e6e6; font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <div style="background-color: #3d8ebb; padding: 10px; text-align: center;">
      <img src="https://www.fs-hirondelle.de/images/logo_bird_white.png" width="50" alt="Bird Logo" />
    </div>
    <div style="background-color: #f4f4f4; padding: 20px; color: #3d8ebb; font-size: 24px; font-weight: bold;">
      ✉ NEWSLETTER
    </div>
    <div style="padding: 20px;">
      <img src="https://www.fs-hirondelle.de/images/logo_hirondelle.png" alt="Flugschule Hirondelle Logo" style="max-width: 100%;" />
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 18px; color: #3d8ebb; font-weight: bold;">Hallo {subtag:name|part:first|ucfirst},</p>
      <p style="font-size: 16px;">Hier kommt der Hauptinhalt des Newsletters...</p>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px; color: #3d8ebb; font-style: italic; font-weight: bold;">Luftige Grüße<br>Team Hirondelle</p>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
      <p style="text-align: center; font-size: 12px; font-weight: bold;">
        Flugschule Hirondelle<br>
        Untergasse 27 - 69469 Weinheim | Am Birnbach 6 - 76829 Landau<br><br>
        Telefon: +49 (0) 6201 8452097<br><br>
        <span style="color: #3d8ebb; font-size: 14px;">Sparkasse SÜW<br>
        IBAN: DE32 5485 0010 1700 1976 41<br>
        BIC: SOLADES1SUW</span><br><br>
        <a href="#" style="color: #3d8ebb;">Datenschutzerklärung</a>
      </p>
    </div>
    <div style="background-color: #3d8ebb; padding: 15px; text-align: center; color: white;">
      Kein Interesse mehr am Newsletter? {unsubscribe}Abmelden{/unsubscribe}
    </div>
  </div>
</div>
`;

async function main() {
  const template = await prisma.newsletterTemplate.create({
    data: {
      name: "Hirondelle Standard Newsletter",
      body: htmlContent,
      design: JSON.stringify(unlayerDesign)
    }
  });
  console.log("Template created:", template.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
