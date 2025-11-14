import { useState } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { API_URL_GEMINI } from "../../common/common"

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente Inmobiliario. Puedo ayudarte con información sobre ventas, clientes, departamentos y leads. ¿Qué te gustaría saber?",
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
      .replace(/^[-•]\s/gm, '')     
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
          incluirDatos: ["ventas", "clientes", "departamentos", "leads"]
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      // Limpiar la respuesta antes de mostrarla
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
    "¿Cuántas ventas se realizaron este mes?",
    "¿Cuántos clientes tenemos?",
    "¿Qué departamentos están disponibles?",
    "Dame un resumen general"
  ]

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <style>{`
        @keyframes pulse-heart {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.05); }
        }
        
        @keyframes wave-ripple {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 0 20px rgba(37, 99, 235, 0);
          }
        }
        
        .btn-pulse {
          animation: pulse-heart 1.5s ease-in-out infinite, wave-ripple 2s ease-out infinite;
        }
      `}</style>

      {!isOpen ? (
        <div className="relative w-20 h-20">
          <button
            onClick={() => setIsOpen(true)}
            className="btn-pulse flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer"
          >
            <MessageCircle size={40} strokeWidth={1.5} />
          </button>

          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white z-20">
            1
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-2xl flex flex-col w-96 h-[500px] overflow-hidden border-2 border-blue-600">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Chat de Soporte</h3>
              <p className="text-xs text-blue-100">Estamos aquí para ayudarte</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-2 rounded-full transition-colors duration-200"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-3 bg-blue-50 border-b border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-2">Preguntas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-white hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-sm">Escribiendo...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="bg-white p-4 border-t-2 border-gray-200 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors duration-200 flex items-center justify-center"
            >
              <Send size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}