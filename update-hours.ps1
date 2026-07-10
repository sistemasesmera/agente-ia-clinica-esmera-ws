$body = @{
  section = "general"
  title = "Informacion general"
  content = "Clinica Esmera es una clinica especializada en medicina estetica y estetica avanzada, donde combinamos tecnologia de ultima generacion con un trato cercano y personalizado. Nuestro objetivo es ayudar a cada paciente a potenciar su belleza de forma natural, segura y adaptada a sus necesidades, siempre de la mano de profesionales cualificados.

Telefono: +34 661 31 02 56
Email: info@clinicaesmera.com
Instagram: @clinicasesmera
Direccion: Paseo Santa Maria de la Cabeza 10, Local 2
Horario: Lunes a Sabado de 10:00 a 19:00"
  active = $true
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/knowledge-base" -Method PATCH -ContentType "application/json" -Body $body | ConvertTo-Json
