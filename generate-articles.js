const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 50;
const FILTER_CATEGORY = process.env.FILTER_CATEGORY || '';

const TOPICS = [
  { title: "Acute Myocardial Infarction", category: "Cardiology" },
  { title: "Heart Failure with Reduced Ejection Fraction", category: "Cardiology" },
  { title: "Atrial Fibrillation", category: "Cardiology" },
  { title: "Hypertensive Crisis", category: "Cardiology" },
  { title: "Aortic Stenosis", category: "Cardiology" },
  { title: "Mitral Valve Regurgitation", category: "Cardiology" },
  { title: "Deep Vein Thrombosis", category: "Cardiology" },
  { title: "Pulmonary Embolism", category: "Cardiology" },
  { title: "Cardiac Tamponade", category: "Cardiology" },
  { title: "Dilated Cardiomyopathy", category: "Cardiology" },
  { title: "Hypertrophic Cardiomyopathy", category: "Cardiology" },
  { title: "Pericarditis", category: "Cardiology" },
  { title: "Infective Endocarditis", category: "Cardiology" },
  { title: "Stable Angina Pectoris", category: "Cardiology" },
  { title: "Ventricular Tachycardia", category: "Cardiology" },
  { title: "Chronic Obstructive Pulmonary Disease", category: "Pulmonology" },
  { title: "Community-Acquired Pneumonia", category: "Pulmonology" },
  { title: "Asthma Acute Exacerbation", category: "Pulmonology" },
  { title: "Pneumothorax", category: "Pulmonology" },
  { title: "Pleural Effusion", category: "Pulmonology" },
  { title: "Acute Respiratory Distress Syndrome", category: "Pulmonology" },
  { title: "Pulmonary Fibrosis", category: "Pulmonology" },
  { title: "Obstructive Sleep Apnea", category: "Pulmonology" },
  { title: "Sarcoidosis", category: "Pulmonology" },
  { title: "Lung Cancer Overview and Staging", category: "Pulmonology" },
  { title: "Ischemic Stroke Acute Management", category: "Neurology" },
  { title: "Hemorrhagic Stroke", category: "Neurology" },
  { title: "Status Epilepticus", category: "Neurology" },
  { title: "Bacterial Meningitis", category: "Neurology" },
  { title: "Guillain-Barre Syndrome", category: "Neurology" },
  { title: "Multiple Sclerosis", category: "Neurology" },
  { title: "Parkinson Disease", category: "Neurology" },
  { title: "Alzheimer Disease", category: "Neurology" },
  { title: "Migraine Pathophysiology and Treatment", category: "Neurology" },
  { title: "Transient Ischemic Attack", category: "Neurology" },
  { title: "Myasthenia Gravis", category: "Neurology" },
  { title: "Amyotrophic Lateral Sclerosis", category: "Neurology" },
  { title: "Trigeminal Neuralgia", category: "Neurology" },
  { title: "Acute Pancreatitis", category: "Gastroenterology" },
  { title: "Cirrhosis and Portal Hypertension", category: "Gastroenterology" },
  { title: "Upper Gastrointestinal Bleeding", category: "Gastroenterology" },
  { title: "Crohn Disease", category: "Gastroenterology" },
  { title: "Ulcerative Colitis", category: "Gastroenterology" },
  { title: "Chronic Hepatitis B", category: "Gastroenterology" },
  { title: "Hepatitis C Diagnosis and Treatment", category: "Gastroenterology" },
  { title: "Acute Liver Failure", category: "Gastroenterology" },
  { title: "Peptic Ulcer Disease", category: "Gastroenterology" },
  { title: "Acute Cholecystitis", category: "Gastroenterology" },
  { title: "Colorectal Cancer", category: "Gastroenterology" },
  { title: "Celiac Disease", category: "Gastroenterology" },
  { title: "Irritable Bowel Syndrome", category: "Gastroenterology" },
  { title: "Spontaneous Bacterial Peritonitis", category: "Gastroenterology" },
  { title: "Hepatic Encephalopathy", category: "Gastroenterology" },
  { title: "Acute Kidney Injury", category: "Nephrology" },
  { title: "Chronic Kidney Disease", category: "Nephrology" },
  { title: "Nephrotic Syndrome", category: "Nephrology" },
  { title: "Nephritic Syndrome", category: "Nephrology" },
  { title: "Hyponatremia", category: "Nephrology" },
  { title: "Hyperkalemia Emergency Management", category: "Nephrology" },
  { title: "Metabolic Acidosis", category: "Nephrology" },
  { title: "IgA Nephropathy", category: "Nephrology" },
  { title: "Polycystic Kidney Disease", category: "Nephrology" },
  { title: "Diabetic Ketoacidosis", category: "Endocrinology" },
  { title: "Hyperosmolar Hyperglycemic State", category: "Endocrinology" },
  { title: "Hypothyroidism", category: "Endocrinology" },
  { title: "Hyperthyroidism and Thyroid Storm", category: "Endocrinology" },
  { title: "Adrenal Insufficiency", category: "Endocrinology" },
  { title: "Cushing Syndrome", category: "Endocrinology" },
  { title: "Pheochromocytoma", category: "Endocrinology" },
  { title: "Primary Hyperaldosteronism", category: "Endocrinology" },
  { title: "Type 2 Diabetes Management", category: "Endocrinology" },
  { title: "Hypoglycemia in Hospitalized Patients", category: "Endocrinology" },
  { title: "Sepsis and Septic Shock", category: "Infectious Disease" },
  { title: "HIV Antiretroviral Therapy", category: "Infectious Disease" },
  { title: "Tuberculosis Diagnosis and Treatment", category: "Infectious Disease" },
  { title: "Clostridioides difficile Infection", category: "Infectious Disease" },
  { title: "Cellulitis and Soft Tissue Infections", category: "Infectious Disease" },
  { title: "Urinary Tract Infection", category: "Infectious Disease" },
  { title: "Invasive Candidiasis", category: "Infectious Disease" },
  { title: "Malaria Diagnosis and Treatment", category: "Infectious Disease" },
  { title: "Healthcare Associated Infections", category: "Infectious Disease" },
  { title: "Disseminated Intravascular Coagulation", category: "Hematology" },
  { title: "Iron Deficiency Anemia", category: "Hematology" },
  { title: "Sickle Cell Disease Acute Complications", category: "Hematology" },
  { title: "Thrombocytopenia Differential Diagnosis", category: "Hematology" },
  { title: "Acute Leukemia Overview", category: "Hematology" },
  { title: "Hodgkin and Non-Hodgkin Lymphoma", category: "Hematology" },
  { title: "Multiple Myeloma", category: "Hematology" },
  { title: "Neutropenic Fever", category: "Hematology" },
  { title: "Tumor Lysis Syndrome", category: "Hematology" },
  { title: "Mechanical Ventilation Basics", category: "Critical Care" },
  { title: "Vasopressor Selection in Shock", category: "Critical Care" },
  { title: "Rapid Sequence Intubation", category: "Critical Care" },
  { title: "Post Cardiac Arrest Care", category: "Critical Care" },
  { title: "ICU Sedation and Analgesia", category: "Critical Care" },
  { title: "Ventilator Associated Pneumonia Prevention", category: "Critical Care" },
  { title: "Anaphylaxis Management", category: "Critical Care" },
  { title: "Traumatic Brain Injury Initial Management", category: "Critical Care" },
  { title: "Toxicological Emergencies and Overdose", category: "Critical Care" },
  { title: "Acute Severe Asthma in the ED", category: "Critical Care" },
];

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function estimateReadTime(html) {
  const words = html.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(5, Math.ceil(words / 200));
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

let existingArticles = [];
if (fs.existsSync('articles.json')) {
  existingArticles = JSON.parse(fs.readFileSync('articles.json', 'utf8'));
}
const existingSlugs = new Set(existingArticles.map(a => a.slug));

let topicsToGenerate = TOPICS.filter(t => !existingSlugs.has(slugify(t.title)));
if (FILTER_CATEGORY) topicsToGenerate = topicsToGenerate.filter(t => t.category === FILTER_CATEGORY);
topicsToGenerate = topicsToGenerate.slice(0, BATCH_SIZE);

if (topicsToGenerate.length === 0) {
  console.log('No new topics to generate.');
  process.exit(0);
}

console.log(`Generating ${topicsToGenerate.length} articles...`);

const template = fs.readFileSync('article-template.html', 'utf8');
if (!fs.existsSync('articles')) fs.mkdirSync('articles');

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function generateArticle(topic) {
  const prompt = `You are a physician writing a clinical reference article for healthcare professionals.

Write a comprehensive clinical article on: "${topic.title}"
Category: ${topic.category}

Return ONLY a valid JSON object, no markdown, no backticks, no extra text:
{
  "summary": "2-3 sentence clinical overview",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": "<h2>Overview</h2><p>...</p><h2>Pathophysiology</h2><p>...</p><h2>Clinical Presentation</h2><p>...</p><h3>Symptoms</h3><ul><li>...</li></ul><h2>Diagnosis</h2><p>...</p><h2>Treatment</h2><p>...</p><h3>First-Line Therapy</h3><p>...</p><h2>Complications</h2><p>...</p><h2>Prognosis</h2><p>...</p>"
}

Requirements:
- content must be valid HTML using only h2, h3, p, ul, ol, li, strong tags
- At least 800 words of clinical content
- Evidence-based, accurate medical information
- Include specific drug names and doses where appropriate`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

async function main() {
  const newArticles = [];

  for (let i = 0; i < topicsToGenerate.length; i++) {
    const topic = topicsToGenerate[i];
    const slug = slugify(topic.title);
    console.log(`[${i + 1}/${topicsToGenerate.length}] ${topic.title}`);

    try {
      const data = await generateArticle(topic);
      const readTime = estimateReadTime(data.content);

      const keyPointsHtml = `<div class="key-points"><div class="label">KEY CLINICAL POINTS</div><ul>${data.keyPoints.map(p => `<li>${p}</li>`).join('')}</ul></div>`;
      const tagsHtml = data.tags.map(t => `<span class="tag">${t}</span>`).join('\n');

      const html = template
        .replace(/{{TITLE}}/g, topic.title)
        .replace(/{{CATEGORY}}/g, topic.category)
        .replace(/{{SUMMARY}}/g, data.summary)
        .replace(/{{READ_TIME}}/g, readTime)
        .replace(/{{DATE}}/g, formatDate())
        .replace(/{{CONTENT}}/g, keyPointsHtml + '\n' + data.content)
        .replace(/{{TAGS}}/g, tagsHtml);

      fs.writeFileSync(`articles/${slug}.html`, html, 'utf8');

      newArticles.push({ slug, title: topic.title, category: topic.category, summary: data.summary, tags: data.tags, readTime });

      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.error(`  FAILED: ${topic.title} — ${err.message}`);
    }
  }

  const updatedIndex = [...existingArticles, ...newArticles];
  fs.writeFileSync('articles.json', JSON.stringify(updatedIndex, null, 2), 'utf8');
  console.log(`\nDone. Generated: ${newArticles.length} | Total: ${updatedIndex.length}`);
}

main().catch(console.error);
