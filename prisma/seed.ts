import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding resources...");

  await prisma.resource.deleteMany();

  await prisma.resource.createMany({
    data: [
      // === INFO RESOURCES ===
      {
        category: "info",
        audience: "all",
        title: "What is Postnatal Depression?",
        description: "Postnatal depression is a type of depression that many parents experience after having a baby. It can affect mothers and fathers, and usually develops within the first six weeks of giving birth, though it can sometimes take several months to appear.",
        url: "https://www.nhs.uk/mental-health/conditions/post-natal-depression/overview/",
      },
      {
        category: "info",
        audience: "mothers",
        title: "Postnatal Depression in Mothers",
        description: "Information specific to maternal postnatal depression, including risk factors such as history of depression, traumatic birth, premature baby, lack of support, and relationship difficulties.",
        url: "https://www.mind.org.uk/information-support/types-of-mental-health-problems/postnatal-depression-and-perinatal-mental-health/",
      },
      {
        category: "info",
        audience: "fathers",
        title: "Postnatal Depression in Fathers",
        description: "Paternal postnatal depression affects around 1 in 10 new fathers. Symptoms can include irritability, withdrawal from family, changes in sleep and appetite, and difficulty bonding with the baby.",
        url: "https://www.nct.org.uk/life-parent/emotions/postnatal-depression-dads-how-spot-signs",
      },
      {
        category: "info",
        audience: "family",
        title: "How to Support a Family Member with Postnatal Depression",
        description: "Guidance for family and friends on recognising signs, offering practical help, listening without judgement, and encouraging professional support.",
        url: "https://www.nhs.uk/mental-health/conditions/post-natal-depression/treatment/",
      },

      // === COPING SKILLS ===
      {
        category: "coping_skill",
        audience: "all",
        title: "Challenging Unhelpful Thoughts",
        description: "Learn to identify automatic negative thoughts, examine the evidence for and against them, and develop more balanced perspectives. This is a core CBT technique.",
      },
      {
        category: "coping_skill",
        audience: "all",
        title: "Sleep Hygiene for New Parents",
        description: "Practical tips for improving sleep quality when caring for a newborn: establishing a wind-down routine, managing night feeds as a team, napping strategies, and creating a restful environment.",
      },
      {
        category: "coping_skill",
        audience: "all",
        title: "Communicating with Your Partner",
        description: "Skills for maintaining open communication during a stressful period. Includes using I-statements, scheduling regular check-ins, and expressing needs without blame.",
      },
      {
        category: "coping_skill",
        audience: "all",
        title: "Relaxation Techniques",
        description: "Guided breathing exercises, progressive muscle relaxation, and grounding techniques that can be done in short windows of time between caring responsibilities.",
      },

      // === PODCASTS / THERAPY TALKS ===
      {
        category: "podcast",
        audience: "all",
        title: "Understanding Your Emotions After Birth",
        description: "A therapist discusses the emotional rollercoaster of new parenthood, normalising difficult feelings and offering frameworks for processing them.",
        url: "https://www.youtube.com/results?search_query=postnatal+depression+therapist+talk",
      },
      {
        category: "podcast",
        audience: "mothers",
        title: "A Mother's Story: Recovery from Postnatal Depression",
        description: "A first-person account of experiencing and recovering from severe postnatal depression, including what helped and what she wishes she had known.",
      },
      {
        category: "podcast",
        audience: "fathers",
        title: "A Father's Perspective on Postnatal Depression",
        description: "A father shares his experience of postnatal depression, the stigma he faced, and how he eventually sought help.",
      },

      // === SERVICES ===
      {
        category: "service",
        audience: "mothers",
        title: "Association for Post Natal Illness (APNI)",
        description: "Provides support to mothers with postnatal illness via a telephone helpline, information leaflets, and a network of volunteers who have experienced postnatal depression.",
        url: "https://apni.org/",
      },
      {
        category: "service",
        audience: "all",
        title: "PANDAS Foundation",
        description: "Pre and Postnatal Depression Advice and Support. Free helpline, email support, and online community for any parent or family member affected.",
        url: "https://pandasfoundation.org.uk/",
      },
      {
        category: "service",
        audience: "fathers",
        title: "Fathers Reaching Out",
        description: "Support specifically for fathers experiencing perinatal mental health difficulties. Peer support and signposting to services.",
        url: "https://www.fathersreachingout.com/",
      },
      {
        category: "service",
        audience: "all",
        title: "Samaritans",
        description: "24/7 confidential emotional support for anyone in distress. Call 116 123 (free from any phone) or email jo@samaritans.org.",
        url: "https://www.samaritans.org/",
      },
      {
        category: "service",
        audience: "all",
        title: "NHS Talking Therapies",
        description: "Free NHS therapy service. You can self-refer for CBT and other talking therapies without needing a GP referral.",
        url: "https://www.nhs.uk/mental-health/talking-therapies-medicine-treatments/talking-therapies-and-counselling/nhs-talking-therapies/",
      },
      {
        category: "service",
        audience: "all",
        title: "Finding a Private Therapist",
        description: "Guidance on finding accredited therapists via the BACP, UKCP, or BPS directories. Includes what to look for and questions to ask.",
        url: "https://www.bacp.co.uk/search/Therapists",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
