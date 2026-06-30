import Link from "next/link";

export default function MembershipAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sage-light/40 via-background to-sage-light/20 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <img src="/sol-icon.svg" alt="SOL" className="h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold font-heading">Membership Agreement</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Private Membership Association Notice &amp; Agreement
          </p>
        </div>
      </section>

      {/* Agreement Content */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sage max-w-none">
            <p className="text-sm text-muted-foreground">
              Becoming a member of <strong>SPACES OF LEARNING</strong>, hereinafter referred to as
              SOL, is required to be able to participate in its activities. Please read the terms
              and conditions to be part of SOL PMA. Membership is free at this time.
            </p>

            <hr className="my-8" />

            <p>
              This Membership Agreement (&ldquo;Agreement&rdquo;) is entered into by and between
              the undersigned individual (&ldquo;Member&rdquo;) and SOL PMA, a Private Membership
              Association (&ldquo;The Association&rdquo;), effective as of the date signed below.
            </p>

            <div className="my-8 rounded-[0_10px_0_10px] border border-primary/20 bg-primary/5 p-6">
              <p className="text-sm font-medium">
                As a Private Member of SOL you acknowledge that you have read and understood the
                following Membership Agreement. As SOL is Hosted in the U.S and the membership fee
                paid in US Dollars, the Association and its memberships are protected under U.S
                Federal Law. This protection provides the following benefits to members and enforces
                the Associations Private status.
              </p>
              <p className="mt-4 text-sm font-medium">
                SOL is a Private Membership Association. A &ldquo;Private Unincorporated Federal
                Training and Education Membership Association.&rdquo; IT IS HEREBY Declared that we
                are exercising our right of &ldquo;freedom of association&rdquo; as guaranteed by
                the 1st and 14th Amendments of the U.S Constitution and equivalent provisions of the
                various State Constitutions. This means that our association activities are restricted
                to the private domain only as a federal organization unincorporated association. The
                Association is protected under the 1st, 4th, 5th, 9th, 10th and 14th Amendments.
              </p>
              <p className="mt-4 text-sm font-semibold text-primary">
                This means the Association is outside the jurisdiction and authority of ALL STATE
                and FEDERAL agencies and Law Enforcement Authorities.
              </p>
            </div>

            <h2 className="text-2xl font-bold font-heading mt-12">MEMBERSHIP AGREEMENT</h2>

            <ol className="mt-6 space-y-6 list-none pl-0">
              <li>
                <strong>1.</strong> This Association of Private Members hereby declares that our
                main objective is to protect our rights to learning freedom of choice.
              </li>
              <li>
                <strong>2.</strong> As Private Members, we affirm our belief that the Creator
                guarantees our rights of free speech, petition, assembly, and the right to gather
                together for the lawful purpose of advising and helping one another in asserting our
                rights.
              </li>
              <li>
                <strong>3.</strong> As a Private Member you understand and agree that you have
                entered into the private jurisdiction when accessing SOL and that you have chosen to
                do so freely and of your own will and that you respect the private nature and
                confidentiality of SOL including but not limited to, all activities experienced by
                any Private Member, which are considered private matters that are absolutely not
                shared in anyway whatsoever with any public entity(ies), corporation(s),
                organization(s) without the express written permission from SOL.
              </li>
              <li>
                <strong>4.</strong> As a Private Member you understand and agree that SOL makes zero
                claims, promises, commitments, guarantees; and any products, services, entertainment
                or otherwise from SOL is not covered by any insurance.
              </li>
              <li>
                <strong>5.</strong> As a Private Member you understand and agree that all products
                and services, all written information including but not limited to, forms, flyers,
                brochures, newsletters, articles, publications, webinars, website material,
                presentations, lectures, broadcasts, processes and all other information provided by
                phone or email, or in any other medium of communication are not intended to discredit
                any system of education, simply offering a necessary accompaniment. Rather SOL, a
                private learning membership association, is functioning for learning purposes.
              </li>
              <li>
                <strong>6.</strong> As a Private Member you understand and agree that some
                information provided is copyrighted and all information is private and confidential,
                however Private Members may make private referrals to SOL.
              </li>
              <li>
                <strong>7.</strong> As a Private Member you understand and agree to forever take
                responsibility, unlimited liability and 100% risk for your own respective safety and
                health.
              </li>
              <li>
                <strong>8.</strong> As a Private Member you understand and agree to select if
                required from our membership those Private Members who are the most skilled to assist
                and facilitate the actual performance and delivery of such services and information
                that is most aligned with your individual and specific needs and that you will make
                this determination freely and of your own will.
              </li>
              <li>
                <strong>9.</strong> As a Private Member you understand and agree that you have the
                absolute freedom to make all your own choices and that you are entitled to access
                information free from censorship in order to make determinations for yourself and
                where applicable you acknowledge, agree and accept that any choice you make regarding
                your health and wellbeing is completely your decision, free from coercion or duress
                and that you make your decisions freely and of your own will.
              </li>
              <li>
                <strong>10.</strong> As a Private Member you understand and agree to act honorably
                towards SOL Members at all times. When providing advice, support, information,
                sharing resources or experiences or interacting with SOL in anyway, you agree to act
                honorably in your communications. For the avoidance of doubt, &ldquo;Acting
                Honorably&rdquo; in this context means that if you were to describe people or actions
                as honorable, you mean that they are good and deserve to be respected and admired, to
                the highest respect and of great esteem and the quality of knowing and doing what is
                morally right.
              </li>
              <li>
                <strong>11.</strong> As a Private Member you understand and agree to abide by the
                SOL code of conduct and agree to recognize any person (irrespective of race, color or
                religion) who is in accordance with these principles.
              </li>
              <li>
                <strong>12.</strong> As a Private Member you understand and agree that within SOL no
                relationship exists other than a Private Member &ndash; to Private Member Association
                relationship and that you understand and agree that you have freely chosen to change
                your legal status when entering SOL from &lsquo;public person&rsquo; to
                &lsquo;Private Member&rsquo; of SOL. You further understand and agree that it is
                entirely your own responsibility to consider the advice and recommendations offered
                to you by your fellow members and to educate yourself as to the efficacy, risk, and
                desirability of all information and advice.
              </li>
              <li>
                <strong>13.</strong> As a Private Member you understand and agree that you are
                entering into this Membership Agreement of your own free will or on behalf of your
                dependent without any pressure or promise of cure or desired outcome. You affirm that
                you do not represent any state or federal agency whose purpose is to regulate the
                practice of learning and education. You have read and understood this document, and
                your questions have been answered fully to your satisfaction. You understand that you
                can withdraw from this agreement and terminate your membership to SOL at any time.
              </li>
            </ol>

            <div className="my-12 rounded-[0_10px_0_10px] border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-lg font-bold font-heading">Notice</h3>
              <p className="mt-2 text-sm">
                SPACES OF LEARNING is a private, membership-based organization and is functioning for
                learning purposes only. No information shared or discussed should be considered as
                legal or health advice. By visiting and entering this website or any of its libraries
                in any way you hereby agree that you entered into a private domain subject to the
                private membership terms of SPACES OF LEARNING. All Members are bound by the SPACES
                OF LEARNING Terms of Use and Membership Agreement when entering the private
                membership site.
              </p>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/what-we-do"
                className="btn-sol btn-sol-primary text-sm uppercase inline-block"
              >
                Agree &amp; Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
