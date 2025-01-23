// const puppeteer = require("puppeteer");
import puppeteer from "puppeteer";
// import request from "request";
import request from "request-promise-native";
import fs from "fs";
// import fs from "fs/promises";

// var request = require("request");

function waitforme(millisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, millisec);
  });
}

async function moveCursorLikeHuman(page, startX, startY, endX, endY) {
  const steps = 30; // Number of steps for smooth movement
  const delay = 10; // Delay between steps in milliseconds

  // Move cursor to starting point
  await page.mouse.move(startX, startY);

  for (let i = 0; i <= steps; i++) {
    // Calculate the next point using linear interpolation
    const x =
      startX + (endX - startX) * (i / steps) + (Math.random() - 0.5) * 50;
    const y =
      startY + (endY - startY) * (i / steps) + (Math.random() - 1.5) * 50;

    // Move cursor to the calculated point
    await page.mouse.move(x, y);
    await waitforme(delay); // Delay for smoothness
  }
}
async function runScript(puppeteer, request) {
  var profileData = JSON.stringify({
    general_profile_information: {
      profile_name: "Social media 1",
      profile_notes: "",
      profile_group: "Unassigned",
      profile_last_edited: "",
      simulated_operating_system: "Windows",
    },
    Proxy: {
      connection_type: "HTTP proxy",
      proxy_url: "acacc76f85c8e994.ika.na.pyproxy.io:16666",
      proxy_username:
        "gtojoao2d-zone-resi-region-us-session-7226153b4d32-sessTime-1",
      proxy_password: "Mi24987",
      proxy_rotating: 0,
    },
  });

  const options = {
    url: "http://localhost:35000/profile/add",
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: { profileData },
  };

  try {
    let dataRes = await request(options, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log("Profile created successfully:", body.profile_browser_id);
        // '0df90c0e-d85d-408e-9b7e-8f437921bd57'
        return body;
      } else {
        console.error("Error creating profile:", error || body);
      }
    });

    var incognitonProfileID = dataRes.profile_browser_id;
    // var incognitonProfileID = "0df90c0e-d85d-408e-9b7e-8f437921bd57";

    var url =
      "http://localhost:35000/automation/launch/puppeteer/" +
      incognitonProfileID;
    // 35000
    async function sleepFor(sleepDuration) {
      var now = new Date().getTime();
      while (new Date().getTime() < now + sleepDuration) {}
    }

    function waitforme(millisec) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("");
        }, millisec);
      });
    }
    // let host = "acacc76f85c8e994.ika.na.pyproxy.io";
    // let port = 16666;
    // let user = "joaogtonew1-zone-resi-region-us-session-af5f0407dec1-sessTime-4";
    // let pass = "perco24";
    async function actions(body, incognitonProfileID) {
      await sleepFor(3000); //Some time for the browser to actually start.
      // Starting and ending coordinates
      const startX = 100;
      const startY = 100;
      const endX = 400;
      const endY = 400;

      if (!body.puppeteerUrl) {
        console.error(
          "Error: puppeteerUrl is not defined in the response body."
        );
        return;
      }
      try {
        // return await (async () => {
        const browserURL = body.puppeteerUrl;
        const browser = await puppeteer.connect({
          browserURL,
        });
        const page = await browser.newPage();
        // Set the viewport size (which controls the window size)

        try {
          await page.goto("https://searchtabs.io/joaonew.php", {
            timeout: 60000,
          });
          // await page.setViewport({
          //   width: 1920,
          //   height: 1080,
          // });
          const client = await page.target().createCDPSession();
          await client.send("Network.clearBrowserCache");
          await client.send("Network.clearBrowserCookies");
          //   console.log("links", links); // Outputs all collected links
          // Step 1: Read the current content
          let numberOfProfile = parseInt(
            await fs.promises.readFile("profile_number.txt", "utf8")
          );
          let numberOfAdClicks = parseInt(
            await fs.promises.readFile("adclick_number.txt", "utf8")
          );

          // console.log("Current file content:", numberOfProfile, numberOfAdClicks);
          // Step 3: Write the updated content back to the file
          // await fs.writeFile(filePath, updatedContent, 'utf8');
          // console.log('File successfully updated!');
          if (
            numberOfProfile !== 0 &&
            numberOfProfile * (25 / 100) <= numberOfAdClicks
          ) {
            console.log(
              "25% of number of profiles is less than number of ad clicks. Skipping ad click."
            );
            const scrollPageLikeHuman = async (page) => {
              let previousHeight = 0;
              let maxScrollAttempts = 20; // Set a maximum number of attempts to reach the end

              for (let attempt = 0; attempt < maxScrollAttempts; attempt++) {
                // Scroll a random amount between 200 to 400 pixels
                const scrollStep = Math.floor(Math.random() * 200) + 200;

                await page.evaluate((step) => {
                  window.scrollBy(0, step);
                }, scrollStep);

                // Wait for a random time between 300ms and 800ms before scrolling again
                const pauseDuration = Math.floor(Math.random() * 500) + 300;
                //   await page.waitForTimeout(pauseDuration);
                await waitforme(pauseDuration);
                if (previousHeight === 0) {
                  await waitforme(5000);
                }
                // Get the current scroll height and compare it with the previous
                const currentHeight = await page.evaluate(
                  () => document.body.scrollHeight
                );

                if (previousHeight === currentHeight) {
                  // Increment attempts if no new height is detected
                  attempt++;
                } else {
                  attempt = 0; // Reset attempts if we’re still scrolling down
                }

                previousHeight = currentHeight;

                // If the page height stops increasing, break out of the loop
                if (attempt >= maxScrollAttempts) break;
              }
            };

            // Usage

            await scrollPageLikeHuman(page);

            // Wait for the pagination container to load
            await page.waitForSelector(".gsc-cursor");
            await moveCursorLikeHuman(page, startX, startY, endX, endY);
            // Get all pagination links
            const paginationLinks = await page.$$(".gsc-cursor-page");
            // console.log('paginationLinks',paginationLinks)
            for (let i = 0; i < paginationLinks.length; i++) {
              // Click on each pagination link
              const randompage =
                paginationLinks[
                  Math.floor(Math.random() * paginationLinks.length)
                ];
              // await paginationLinks[i + randompage ].click();
              // await paginationLinks[i+2].click();
              await randompage.click();
              await waitforme(3000);
              break;
            }
            await waitforme(3000);
            await scrollPageLikeHuman(page);
            await moveCursorLikeHuman(page, startX, startY, endX, endY);
            // numberOfProfile++;
            // Step 3: Write the updated content back to the file
            let n = numberOfProfile + 1;
            // console.log('n',n)
            await fs.promises.writeFile("profile_number.txt", `${n}`, "utf8");
          } else {
            try {
              // Get the iframe element
              const iframeElement = await page.$("iframe#master-1");

              // Access the content of the iframe
              const frame = await iframeElement.contentFrame();

              // Extract all website links from the adBlock div
              await frame.waitForSelector("#adBlock");
              await waitforme(4000);
              const links = await frame.evaluate(() => {
                // Select the main container
                const adContainer = document.querySelector("#adBlock");

                // Find all anchor tags inside the container and get their href attributes
                return Array.from(
                  adContainer.querySelectorAll("a.p_.styleable-title.a")
                )
                  .map((anchor) => anchor.href)
                  .filter((href) => href.includes("http"));
              });

              for (let i = 0; i < links.length; i++) {
                const newpage = await browser.newPage();
                // await newpage.setViewport({
                //   width: 900,
                //   height: 1080,
                // });
                try {
                  const randomElement =
                    links[Math.floor(Math.random() * links.length)];
                  // console.log('rdm',randomElement)
                  await newpage.goto(randomElement, {
                    timeout: 100000,
                  });

                  const scrollPageLikeHuman = async (page) => {
                    let previousHeight = 0;
                    let maxScrollAttempts = 20; // Set a maximum number of attempts to reach the end

                    for (
                      let attempt = 0;
                      attempt < maxScrollAttempts;
                      attempt++
                    ) {
                      // Scroll a random amount between 200 to 400 pixels
                      const scrollStep = Math.floor(Math.random() * 200) + 200;

                      await page.evaluate((step) => {
                        window.scrollBy(0, step);
                      }, scrollStep);

                      // Wait for a random time between 300ms and 800ms before scrolling again
                      const pauseDuration =
                        Math.floor(Math.random() * 500) + 300;
                      //   await page.waitForTimeout(pauseDuration);
                      await waitforme(pauseDuration);
                      if (previousHeight === 0) {
                        await waitforme(5000);
                      }
                      // Get the current scroll height and compare it with the previous
                      const currentHeight = await page.evaluate(
                        () => document.body.scrollHeight
                      );

                      if (previousHeight === currentHeight) {
                        // Increment attempts if no new height is detected
                        attempt++;
                      } else {
                        attempt = 0; // Reset attempts if we’re still scrolling down
                      }

                      previousHeight = currentHeight;

                      // If the page height stops increasing, break out of the loop
                      if (attempt >= maxScrollAttempts) break;
                    }
                  };

                  // Usage
                  await scrollPageLikeHuman(newpage);
                  await moveCursorLikeHuman(
                    newpage,
                    startX,
                    startY,
                    endX,
                    endY
                  );
                  await waitforme(3000);
                  await newpage.close();
                } catch (e) {
                  console.log(
                    "Website has failed to load, moving to the next website...."
                  );
                  await newpage.close();
                }

                //   const pauseDuration = Math.floor(Math.random() * 8000) + 5000;
                //   console.log("pauseDurationNewTab", pauseDuration/1000 + " seconds");
                //   await waitforme(pauseDuration);
                // numberOfProfile++;
                // Step 3: Write the updated content back to the file

                let n = numberOfProfile + 1;
                let na = numberOfAdClicks + 1;
                // console.log("n", n,na);
                await fs.promises.writeFile(
                  "profile_number.txt",
                  `${n}`,
                  "utf8"
                );
                await fs.promises.writeFile(
                  "adclick_number.txt",
                  `${na}`,
                  "utf8"
                );

                break;
              }

              // Wait for the pagination container to load
              await page.waitForSelector(".gsc-cursor");

              // Get all pagination links
              const paginationLinks = await page.$$(".gsc-cursor-page");
              // console.log('paginationLinks',paginationLinks)
              for (let i = 0; i < paginationLinks.length; i++) {
                // Click on each pagination link
                const randompage =
                  paginationLinks[
                    Math.floor(Math.random() * paginationLinks.length)
                  ];
                // await paginationLinks[i + randompage ].click();
                await randompage.click();

                await waitforme(3000);
                break;
              }
            } catch (e) {
              // console.log("error", e);
            }
          }

          await browser.close();

          let deleteUrl = `http://localhost:35000/profile/delete/${incognitonProfileID}`;
          // console.log("du", deleteUrl);
          await request(
            {
              url: deleteUrl,
            },
            async function (error, response, body) {
              if (!error && response.statusCode === 200) {
                console.log("resbody", body);
              }
            }
          );
          //   return;
        } catch (e) {
          // continue
          console.log(
            "Time out error, Page take more than 60 sec to load, so moving to the next...."
          );
          await browser.close();
        }
        // })();

        //   return
      } catch (err) {
        console.error(err);
      }

      // return;
    }

    let res = await request(
      {
        url: url,
        json: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
      async function (error, response, body) {
        //   console.log("bodyres", body);
        if (!error && response.statusCode === 200) {
          return body;
        }
      }
    );
    await actions(res, incognitonProfileID);
  } catch (err) {
    console.error("Error connecting to the server:", err);
    return;
  }
  //   console.log("dataRes", dataRes,res);
  //   return;
}

while (true) {
  let numberOfProfile = parseInt(
    await fs.promises.readFile("profile_number.txt", "utf8")
  );
  let numberOfAdClicks = parseInt(
    await fs.promises.readFile("adclick_number.txt", "utf8")
  );

  console.log(
    `25 % Number Of Profile ${numberOfProfile}`,
    numberOfProfile * (25 / 100)
  );
  console.log(`Number Of ad Click`, numberOfAdClicks);
  await runScript(puppeteer, request);
  const pauseDuration = Math.floor(Math.random() * 80000) + 100000;
  console.log("Sleeping for", pauseDuration / 1000 + " seconds Zzzz..");
  await waitforme(pauseDuration);
}
