import { prisma } from '../utils/prisma';
import { getNewsletterTransporter } from '../utils/newsletterTransporter';
import { getCommentSettings } from '../routes/commentSettings.routes';

// Old's real CComment notification emails - deep-verified against
// settings.xml's `notify_moderators`/`moderators` (new-comment alert) and
// the real reply-notification behavior implied by emailqueues' "Sent to"
// column - this app never sent either. Every attempt (success or failure)
// is logged as a real CommentEmailQueue row, matching old's real
// Von/Gesendet-von/Gesendet-an/Betreff/Typ/Status columns (Admin >
// Kommentare > E-Mail-Warteschlange), not a silent fire-and-forget.
async function sendAndLog(params: {
  commentId: string;
  toEmail: string;
  subject: string;
  body: string;
  type: 'moderator_notification' | 'reply_notification';
  fromEmail?: string | null;
  fromName?: string | null;
}) {
  const { transporter, config: mailConfig } = await getNewsletterTransporter();
  const fromEmail = params.fromEmail || mailConfig?.fromEmail || 'info@fs-hirondelle.de';
  const fromName = params.fromName || mailConfig?.fromName || 'Flugschule Hirondelle';
  let status = 'sent';
  let error: string | null = null;
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: params.toEmail,
      subject: params.subject,
      html: params.body,
    });
  } catch (e: any) {
    status = 'failed';
    error = String(e?.message || e);
    console.error('Error sending comment notification email:', e);
  }
  await prisma.commentEmailQueue.create({
    data: {
      commentId: params.commentId,
      fromEmail,
      fromName,
      toEmail: params.toEmail,
      subject: params.subject,
      body: params.body,
      type: params.type,
      status,
      error: error || undefined,
    },
  });
}

function targetLabel(comment: { eventId: string | null; pageSlug: string | null }, eventTitle?: string | null) {
  return eventTitle || comment.pageSlug || 'der Website';
}

// Old's real `notify_moderators` toggle - fired on every new top-level
// comment (not replies, which have their own notification below).
export async function notifyModeratorsOfNewComment(comment: {
  id: string;
  name: string | null;
  email: string | null;
  content: string;
  eventId: string | null;
  pageSlug: string | null;
}) {
  try {
    const settings = await getCommentSettings();
    if (!settings.notifyModerators || !settings.moderatorEmail) return;

    let eventTitle: string | null = null;
    if (comment.eventId) {
      const event = await prisma.event.findUnique({ where: { id: comment.eventId }, select: { title: true } });
      eventTitle = event?.title || null;
    }

    await sendAndLog({
      commentId: comment.id,
      toEmail: settings.moderatorEmail,
      subject: `Neuer Kommentar wartet auf Freigabe: ${targetLabel(comment, eventTitle)}`,
      body: `
        <p>Ein neuer Kommentar wurde eingereicht und wartet auf Freigabe:</p>
        <p><strong>Von:</strong> ${comment.name || 'Anonym'} ${comment.email ? `(${comment.email})` : ''}<br/>
        <strong>Auf:</strong> ${targetLabel(comment, eventTitle)}</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#444;">${comment.content.replace(/\n/g, '<br/>')}</blockquote>
        <p>Zur Moderation: Admin &gt; Kommentare.</p>
      `,
      type: 'moderator_notification',
    });
  } catch (error) {
    console.error('Error in notifyModeratorsOfNewComment:', error);
  }
}

// Fired when a comment gets a reply (public reply-to-another-comment OR an
// admin's own reply via the admin UI) - notifies the ORIGINAL commenter,
// if they left a real email and the setting is on.
export async function notifyReplyToCommenter(parentComment: {
  id: string;
  name: string | null;
  email: string | null;
  eventId: string | null;
  pageSlug: string | null;
}, replyContent: string) {
  try {
    if (!parentComment.email) return;
    const settings = await getCommentSettings();
    if (!settings.notifyOnReply) return;

    let eventTitle: string | null = null;
    if (parentComment.eventId) {
      const event = await prisma.event.findUnique({ where: { id: parentComment.eventId }, select: { title: true } });
      eventTitle = event?.title || null;
    }

    await sendAndLog({
      commentId: parentComment.id,
      toEmail: parentComment.email,
      subject: `Antwort auf Ihren Kommentar: ${targetLabel(parentComment, eventTitle)}`,
      body: `
        <p>Hallo ${parentComment.name || ''},</p>
        <p>Ihr Kommentar auf <strong>${targetLabel(parentComment, eventTitle)}</strong> hat eine Antwort erhalten:</p>
        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#444;">${replyContent.replace(/\n/g, '<br/>')}</blockquote>
        <p>Mit freundlichen Grüßen,<br/>Ihr Team der Flugschule Hirondelle</p>
      `,
      type: 'reply_notification',
    });
  } catch (error) {
    console.error('Error in notifyReplyToCommenter:', error);
  }
}
