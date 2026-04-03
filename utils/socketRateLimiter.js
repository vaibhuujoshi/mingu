const userMessageCount = new Map();

export function canSendMessage(userId) {
    const now = Date.now();

    if (!userMessageCount.has(userId)) {
        userMessageCount.set(userId, []);
    }

    const timeStamps = userMessageCount.get(userId);

    const filtered = timeStamps.filtered(ts => ts - now < 10000);

    filtered.push(now);

    userMessageCount(userId, filtered);

    return filtered.length <= 5;
}