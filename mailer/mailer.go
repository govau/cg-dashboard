package mailer

import (
	"net/smtp"

	"github.com/jordan-wright/email"
)

// Mailer is a interface that any mailer should implement.
type Mailer interface {
	// SendEmail sends an email
	SendEmail(emailAddress string, subject string, body []byte) error
}

// SMTPMailer sends mail via these SMTP settings
type SMTPMailer struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
}

// SendEmail sends an email
func (s *SMTPMailer) SendEmail(emailAddress, subject string, body []byte) error {
	e := email.NewEmail()
	e.From = "cloud.gov <" + s.From + ">"
	e.To = []string{" <" + emailAddress + ">"}
	e.HTML = body
	e.Subject = subject
	return e.Send(s.Host+":"+s.Port, smtp.PlainAuth("", s.Username, s.Password, s.Host))
}
