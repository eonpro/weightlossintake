# Airtable Integration Setup

## Step 1: Create an Airtable Base

1. Go to [Airtable](https://airtable.com) and sign in
2. Create a new base called "EONMeds Intake"
3. Create a table called "Intake Submissions" with these fields:

| Field Name | Field Type |
|------------|------------|
| Session ID | Single line text |
| First Name | Single line text |
| Last Name | Single line text |
| Email | Email |
| Phone | Phone number |
| Date of Birth | Single line text |
| State | Single line text |
| Address | Long text |
| Current Weight (lbs) | Number |
| Ideal Weight (lbs) | Number |
| Height (feet) | Number |
| Height (inches) | Number |
| BMI | Number (decimal) |
| Goals | Long text |
| Activity Level | Single line text |
| Chronic Conditions | Long text |
| Digestive Conditions | Long text |
| Medications | Long text |
| Allergies | Long text |
| Mental Health Conditions | Long text |
| GLP-1 History | Single line text |
| GLP-1 Type | Single line text |
| Side Effects | Long text |
| Medication Preference | Single line text |
| Qualified | Checkbox |
| Submitted At | Date/Time |
| Language | Single line text |

## Step 2: Get Your Credentials

### Personal Access Token (PAT)
1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Give it a name (e.g., "EONMeds Intake")
4. Add scopes:
   - `data.records:read`
   - `data.records:write`
5. Under "Access", select your EONMeds Intake base
6. Click "Create token"
7. **Copy the token immediately** (starts with `pat...`) - you won't see it again!

### Base ID
1. Open your Airtable base
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXX/...`
3. The Base ID is the part starting with `app` (e.g., `appXXXXXXXXXXXXX`)

**Or:**
1. Go to https://airtable.com/developers/web/api/introduction
2. Select your base from the dropdown
3. The Base ID is shown in the documentation

## Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Airtable Configuration (Personal Access Token)
AIRTABLE_PAT=pat_xxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=Intake Submissions
```

## Step 4: For Vercel Deployment

Add these environment variables in your Vercel project settings:
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development:
   - `AIRTABLE_PAT` = your personal access token (starts with `pat...`)
   - `AIRTABLE_BASE_ID` = your base ID (starts with `app...`)
   - `AIRTABLE_TABLE_NAME` = `Intake Submissions`

## Testing

Once configured, complete an intake form. The data will appear in your Airtable base within seconds.

Check the API status: `GET /api/airtable`

