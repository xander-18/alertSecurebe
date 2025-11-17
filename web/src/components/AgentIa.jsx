import { useState } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
// import { API_URL_GEMINI } from "../common/common"
import { API_URL_GEMINI } from "../../../web-automatizacion/common/common"
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de monitoreo IoT. Puedo ayudarte con información sobre sensores, mediciones recientes y alertas del sistema. ¿Qué te gustaría saber?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*/g, '')          
      .replace(/\*/g, '')            
      .replace(/#{1,6}\s/g, '')     
      .replace(/`{1,3}/g, '')        
      .replace(/^\d+\.\s/gm, '')     
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') 
      .replace(/_{1,2}/g, '')        
      .replace(/~{2}/g, '')          
      .trim()
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const response = await fetch(API_URL_GEMINI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pregunta: inputValue,
          incluirDatos: ["sensores", "mediciones", "alertas"]
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      const respuestaLimpia = cleanMarkdown(data.respuesta || "Lo siento, no pude generar una respuesta.")

      const botMessage = {
        id: messages.length + 2,
        text: respuestaLimpia,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error al consultar la API:", error)
      
      const errorMessage = {
        id: messages.length + 2,
        text: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.",
        sender: "bot",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
  }

  const quickQuestions = [
    "¿Cuántos sensores están activos?",
    "¿Hay alguna alerta o sensor inactivo?",
    "Muéstrame las últimas mediciones",
    "Dame un resumen general del sistema"
  ]

  return (
    <div className="chatbot-container">
      {!isOpen ? (
        <div className="chatbot-button-wrapper">
          <button
            onClick={() => setIsOpen(true)}
            className="chatbot-button"
          >
            <MessageCircle size={40} strokeWidth={1.5} />
          </button>

          <div className="chatbot-badge">
            1
          </div>
        </div>
      ) : (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <h3>Asistente IoT</h3>
              <p>Monitor de sensores y alertas</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-button"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="chatbot-quick-questions">
              <p className="chatbot-quick-questions-title">Preguntas rápidas:</p>
              <div className="chatbot-quick-questions-list">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="chatbot-quick-question-button"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message ${message.sender}`}>
                <div className="chatbot-message-content">
                  {message.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-loading">
                <div className="chatbot-loading-content">
                  <Loader2 size={16} className="chatbot-loading-spinner" />
                  <span className="chatbot-loading-text">Analizando datos...</span>
                </div>
              </div>
            )}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta sobre tus sensores..."
              disabled={isLoading}
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="chatbot-send-button"
            >
              <Send size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}