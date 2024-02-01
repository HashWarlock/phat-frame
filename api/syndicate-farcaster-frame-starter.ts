// Two very important environment variables to set that you MUST set in Vercel:
// - SYNDICATE_FRAME_API_KEY: The API key that you received for frame.syndicate.io.
// DM @Will on Farcaster/@WillPapper on Twitter to get an API key.
import { VercelRequest, VercelResponse } from "@vercel/node";
import { SyndicateClient } from "@syndicateio/syndicate-node";

const syndicate = new SyndicateClient({
  token: () => {
    const apiKey = process.env.SYNDICATE_API_KEY;
    if (typeof apiKey === "undefined") {
      // If you receive this error, you need to define the SYNDICATE_API_KEY in
      // your Vercel environment variables. You can find the API key in your
      // Syndicate project settings under the "API Keys" tab.
      throw new Error(
          "SYNDICATE_API_KEY is not defined in environment variables."
      );
    }
    return apiKey;
  },
});

export default async function (req: VercelRequest, res: VercelResponse) {
  // Farcaster Frames will send a POST request to this endpoint when the user
  // clicks the button. If we receive a POST request, we can assume that we're
  // responding to a Farcaster Frame button click.
  if (req.method == "POST") {
    try {
      console.log("Received POST request from Farcaster Frame button click");
      console.log("Farcaster Frame request body:", req.body);
      console.log("Farcaster Frame trusted data:", req.body.trustedData);
      console.log(
        "Farcaster Frame trusted data messageBytes:",
        req.body.trustedData.messageBytes
      );
      const messageBytes = req.body.trustedData.messageBytes;

      const requestTx = await syndicate.transact.sendTransaction({
        projectId: "d4187848-ff1d-4cce-b7ea-fc19896b7f4f",
        contractAddress: "0xBeFD018F3864F5BBdE665D6dc553e012076A5d44",
        chainId: 84532,
        functionSignature: "request(string calldata reqData, uint32 numWords)",
        args: {
          reqData: messageBytes,
          numWords: 1,
        },
      });
      console.log("Syndicate Transaction ID: ", requestTx.transactionId);
      console.log("Sending confirmation as Farcaster Frame response");

      res.status(200).setHeader("Content-Type", "text/html").send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width" />
            <meta property="og:title" content="You've minted your commemorative NFT for Syndicate's Frame API!" />
            <meta
              property="og:image"
              content="https://phat-frame.vercel.app/img/phat-frame.png"
            />
            <meta property="fc:frame" content="vNext" />
            <meta
              property="fc:frame:image"
              content="https://phat-frame.vercel.app/img/phat-frame-cropped.png"
            />
            <meta
              property="fc:frame:button:1"
              content="You've been selected to the Phat Squid Frame Club!"
            />
          </head>
        </html>
      `);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  } else {
    // If the request is not a POST, we know that we're not dealing with a
    // Farcaster Frame button click. Therefore, we should send the Farcaster Frame
    // content
    res.status(200).setHeader("Content-Type", "text/html").send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <meta property="og:title" content="Do you qualify for the Phat Squid Game?!" />
        <meta
          property="og:image"
          content="https://phat-frame.vercel.app/img/phat-frame.png"
        />
        <meta property="fc:frame" content="vNext" />
        <meta
          property="fc:frame:image"
          content="https://phat-frame.vercel.app/img/phat-frame-cropped.png"
        />
        <meta property="fc:frame:button:1" content="Do you qualify to mint a Phat Squid NFT?" />
        <meta
          name="fc:frame:post_url"
          content="https://phat-frame.vercel.app/api/syndicate-farcaster-frame-starter"
        />
      </head>
    </html>
    `);
  }
}
