const BOOKING_ASSISTANT_URL =
  process.env.EXPO_PUBLIC_BOOKING_ASSISTANT_API_URL ||
  process.env.EXPO_PUBLIC_CONVERSATIONAL_BOOKING_API_URL;

const BOOKING_CREATE_URL = process.env.EXPO_PUBLIC_BOOKING_CREATE_API_URL;

export const REQUIRED_BOOKING_SLOTS = [
  'service_type',
  'area_acres',
  'date',
  'village',
];

export const BOOKING_SYSTEM_PROMPT = `
You are a voice booking assistant for Indian farmers booking farm services or equipment.
Return pure JSON only: {"speech":"...","slots":{},"isComplete":false,"lang":"en"}.
Required slots: service_type, area_acres, date, village.
Optional slots such as crop_type may be captured only when the farmer naturally says them.
Ask exactly one short question for the next missing required slot.
Keep speech under 20 words and always in the farmer's language.
Never return prose, markdown, or explanations outside JSON.
`;

function normalizeSlots(slots = {}) {
  return Object.entries(slots).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function parseJsonPayload(payload) {
  if (payload && typeof payload === 'object') {
    return payload;
  }

  if (typeof payload !== 'string') {
    throw new Error('Assistant returned an invalid response.');
  }

  const trimmed = payload.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');

  if (jsonStart < 0 || jsonEnd < jsonStart) {
    throw new Error('Assistant did not return JSON.');
  }

  return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));
}

function normalizeAssistantResult(payload) {
  const parsed = parseJsonPayload(payload?.result ?? payload?.message ?? payload);

  return {
    speech: String(parsed.speech || '').trim(),
    slots: normalizeSlots(parsed.slots),
    isComplete: Boolean(parsed.isComplete),
    lang: parsed.lang || 'en',
  };
}

// ─────────────────────────────────────────────────────────────────
// Mock API for R&D / dummy responses (no backend required)
// ─────────────────────────────────────────────────────────────────

const MOCK_RESPONSES_EN = [
  { speech: 'Which service or equipment do you need?', slots: {} },
  { speech: 'Got it. How many acres is your field?', slots: { service_type: 'Tractor ploughing' } },
  { speech: 'Okay. When do you need it?', slots: { area_acres: '5' } },
  { speech: 'Perfect. Which village are you in?', slots: { date: '2026-06-15' } },
  {
    speech: 'Thank you. Let me confirm: Tractor ploughing for 5 acres on 2026-06-15 in Kandukur. Is this correct?',
    slots: { village: 'Kandukur' },
    isComplete: true,
  },
];

const MOCK_RESPONSES_HI = [
  { speech: 'आपको कौन सी सेवा या उपकरण चाहिए?', slots: {} },
  { speech: 'ठीक है। आपके खेत की कितनी एकड़ है?', slots: { service_type: 'ट्रैक्टर हल चलाना' } },
  { speech: 'ठीक है। आपको कब चाहिए?', slots: { area_acres: '5' } },
  { speech: 'शानदार। आप किस गांव में हैं?', slots: { date: '2026-06-15' } },
  {
    speech: 'धन्यवाद। पुष्टि करें: ट्रैक्टर हल चलाना, 5 एकड़, 2026-06-15 को कंदूकुर गांव में। क्या यह ठीक है?',
    slots: { village: 'Kandukur' },
    isComplete: true,
  },
];

const MOCK_RESPONSES_TE = [
  { speech: 'మీకు ఏ సేవ లేదా పరికరం కావాలి?', slots: {} },
  { speech: 'సరే. మీ పొలం ఎన్ని ఎకరాలు?', slots: { service_type: 'ట్రాక్టర్ దున్నకం' } },
  { speech: 'సరే. మీకు ఎప్పుడు కావాలి?', slots: { area_acres: '5' } },
  { speech: 'చక్కగా ఉంది. మీరు ఏ గ్రామంలో ఉన్నారు?', slots: { date: '2026-06-15' } },
  {
    speech: 'ధన్యవాదాలు. నిర్ధారించండి: ట్రాక్టర్ దున్నకం, 5 ఎకరాలు, 2026-06-15న కందూకూర్ గ్రామంలో. ఇది సరైనదేనా?',
    slots: { village: 'Kandukur' },
    isComplete: true,
  },
];

const MOCK_RESPONSES = {
  en: MOCK_RESPONSES_EN,
  hi: MOCK_RESPONSES_HI,
  te: MOCK_RESPONSES_TE,
};

let mockTurnCount = 0;

function generateMockResponse(transcript, locale = 'en') {
  const responses = MOCK_RESPONSES[locale] || MOCK_RESPONSES.en;
  const response = responses[Math.min(mockTurnCount, responses.length - 1)];
  mockTurnCount += 1;

  return {
    speech: response.speech,
    slots: response.slots,
    isComplete: response.isComplete || false,
    lang: locale,
  };
}

export function resetMockTurnCount() {
  mockTurnCount = 0;
}

export async function callConversationalBookingApi({
  transcript,
  slots,
  locale,
  messages,
}) {
  // Use mock API if backend is not configured
  if (!BOOKING_ASSISTANT_URL) {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateMockResponse(transcript, locale);
  }

  const response = await fetch(BOOKING_ASSISTANT_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemPrompt: BOOKING_SYSTEM_PROMPT,
      transcript,
      locale,
      slots,
      messages,
      requiredSlots: REQUIRED_BOOKING_SLOTS,
    }),
  });

  if (!response.ok) {
    throw new Error(`Booking assistant failed (${response.status}).`);
  }

  return normalizeAssistantResult(await response.json());
}

export async function createVoiceBooking({ slots, locale }) {
  const targetUrl = BOOKING_CREATE_URL || BOOKING_ASSISTANT_URL;

  // Use mock API if backend is not configured
  if (!targetUrl) {
    await new Promise(resolve => setTimeout(resolve, 800));
    resetMockTurnCount();
    
    return {
      success: true,
      bookingId: `BK-${Date.now()}`,
      message: locale === 'hi' ? 'बुकिंग सफल रही!' : locale === 'te' ? 'బుకింగ్ విజయవంతమైనది!' : 'Booking successful!',
      slots,
      createdAt: new Date().toISOString(),
    };
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'create_booking',
      locale,
      slots,
      source: 'voice_assistant',
    }),
  });

  if (!response.ok) {
    throw new Error(`Booking creation failed (${response.status}).`);
  }

  resetMockTurnCount();
  return response.json();
}
