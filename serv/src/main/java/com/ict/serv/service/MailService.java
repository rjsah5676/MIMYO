package com.ict.serv.service;

import com.ict.serv.config.GoogleOAuthConfig;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final GoogleOAuthConfig googleOAuthConfig;

    public boolean sendVerificationCode(String email, String code) {
        try {
            String subject = "\uD83D\uDD10 인증번호를 확인해주세요.";
            String message = "<div style=\"font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; border: 2px solid #ccc; width: 80%; margin: 0 auto; padding: 20px; border-radius: 10px;\">" +
                    "<div style=\"text-align: center; margin-bottom: 20px; background-color: #222; color: #fff; padding: 10px; letter-spacing: 10px; font-weight: bold; border-radius: 10px; font-size: 30px;\">MIMYO</div>" +
                    "<h2 style=\"color: #2c3e50; text-align: center;\">🔐 인증번호 안내</h2>" +
                    "<p style=\"text-align: center;\">안녕하세요! 😊</p>" +
                    "<p style=\"text-align: center;\">요청하신 인증번호는 아래와 같습니다:</p>" +
                    "<div style=\"width: 50%; margin: 0 auto; padding: 10px 15px; background-color: #f4f4f4; border: 1px dashed #ccc; display: block; text-align: center; font-size: 18px; font-weight: bold; letter-spacing: 2px;\">" +
                    "✅ 인증번호: <span style=\"color: #D97B6D;\">" + code + "</span>" +
                    "</div>" +
                    "<p style=\"text-align: center;\">타인에게 공유하지 마시고, 정확히 입력해주세요.</p>" +
                    "<p style=\"color: #999; font-size: 14px; text-align: center;\">감사합니다. 🙏</p>" +
                    "</div>";

            sendEmail(email, subject, message);
            return true;
        } catch (Exception e) {
            log.error("이메일 전송 실패: {}", e.getMessage());
            throw new RuntimeException("이메일 전송 실패: " + e.getMessage());
        }
    }

    private void sendEmail(String recipientEmail, String subject, String body) {
        String accessToken = googleOAuthConfig.getAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            log.error("액세스 토큰이 없어 이메일 전송 실패");
            return;
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth.mechanisms", "XOAUTH2");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(googleOAuthConfig.getEmail(), accessToken);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(googleOAuthConfig.getEmail()));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject(subject);
            message.setContent(body, "text/html; charset=UTF-8");

            Transport.send(message);
            log.info("📩 이메일 전송 성공: {}", recipientEmail);
        } catch (MessagingException e) {
            log.error("이메일 전송 오류", e);
            throw new RuntimeException("이메일 전송 실패");
        }
    }

    public void sendFindIdEmail(String email, String userId) {
        String subject = "아이디 찾기 안내";
        String message = "회원님의 아이디는 [" + userId + "] 입니다.";
        sendEmail(email, subject, message);
    }

    public void sendPasswordResetEmail(String email, String code) {
        String subject = "비밀번호 재설정 인증번호";
        String message = "비밀번호 재설정을 위한 인증번호: " + code;
        sendEmail(email, subject, message);
    }

    public String generateVerificationCode() {
        return String.valueOf((int) (Math.random() * 900000) + 100000);
    }
}
