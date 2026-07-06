import bizSdk from 'facebook-nodejs-business-sdk';
import crypto from 'crypto';

const { CustomData, EventRequest, UserData, ServerEvent, FacebookAdsApi } = bizSdk;

const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const PIXEL_ID     = process.env.FB_PIXEL_ID;

const hash = (val) =>
  val
    ? crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex')
    : undefined;

const sendServerEvent = async (eventName, req, customData = {}, eventId = null) => {
  if (!ACCESS_TOKEN || !PIXEL_ID) {
    console.warn('[FB CAPI] Missing ACCESS_TOKEN or PIXEL_ID — skipping');
    return;
  }

  try {
    FacebookAdsApi.init(ACCESS_TOKEN);

    const userData = new UserData()
      .setClientIpAddress(req.fbData?.ip || req.ip)
      .setClientUserAgent(req.fbData?.userAgent || req.headers['user-agent'])
      .setFbp(req.fbData?.fbp || req.cookies?._fbp)
      .setFbc(req.fbData?.fbc || req.cookies?._fbc);

    if (req.body?.email) userData.setEmails([hash(req.body.email)]);
    if (req.body?.phone) userData.setPhones([hash(req.body.phone)]);
    if (req.body?.name) {
      const parts = req.body.name.trim().split(' ');
      userData.setFirstNames([hash(parts[0])]);
      if (parts[1]) userData.setLastNames([hash(parts[1])]);
    }

    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setEventId(eventId || `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      .setEventSourceUrl(req.fbData?.referer || req.headers.referer || req.headers.origin || '')
      .setActionSource('website')
      .setUserData(userData);

    if (Object.keys(customData).length) {
      const cd = new CustomData();
      if (customData.value)        cd.setValue(Number(customData.value));
      if (customData.currency)     cd.setCurrency(customData.currency);
      if (customData.content_ids)  cd.setContentIds(customData.content_ids.map(String));
      if (customData.num_items)    cd.setNumItems(customData.num_items);
      if (customData.content_type) cd.setContentType(customData.content_type);
      serverEvent.setCustomData(cd);
    }

    const eventRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID)
      .setEvents([serverEvent]);

    await eventRequest.execute();
    console.log(`[FB CAPI] ✓ ${eventName} sent`);
  } catch (err) {
    console.error(`[FB CAPI] ✗ ${eventName} failed:`, err.message);
  }
};

export { sendServerEvent };