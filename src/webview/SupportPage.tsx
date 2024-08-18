import React from "react";
import { ContactSupportIcon } from "./components/icons/ContactSupportIcon";
import { FacebookIcon } from "./components/icons/socialMediaIcons/FacebookIcon";
import { InstagramIcon } from "./components/icons/socialMediaIcons/InstagramIcon";
import { LinkedInIcon } from "./components/icons/socialMediaIcons/linkedInIcon";
import { RedditIcon } from "./components/icons/socialMediaIcons/RedditIcon";
import { TwitterIcon } from "./components/icons/socialMediaIcons/TwitterIcon";
import { YoutubeIcon } from "./components/icons/socialMediaIcons/YotubeIcon";

function SupportPage() {
  return (
    <>
      <div className="SupportContainer">
        <div className="contactSupport">
          <p className="contactSupportTitle">Contact Support</p>
          <ContactSupportIcon />
          <p className="contactSupportDialogue">Still have a question or need our help?</p>
          <p className="contactSupportDialogue">
            Is there a feature you'd like to see? Let us know!
          </p>
          <a className="contactMail" href="mailto:insteadbusiness@gmail.com">
            insteadbusiness@gmail.com
          </a>
          <p className="socialLinkDialogue">You can also find us here:</p>
          <div className="socialMediaIcons">
            {/* need to update linke */}
            <a href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F">
              <FacebookIcon />
            </a>
            <a href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F">
              <InstagramIcon />
            </a>
            <a href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F">
              <RedditIcon />
            </a>
            <a href="https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F">
              <TwitterIcon />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default SupportPage;
