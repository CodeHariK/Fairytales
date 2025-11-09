"use client"

import { useState, FormEvent } from "react"
import { useQuery } from "@connectrpc/connect-query"
import { say } from "@/gen/connectrpc/eliza/v1/eliza-ElizaService_connectquery"

export default function ConnectQueryPage() {
    const [inputValue, setInputValue] = useState("Hello, how are you?")
    const [querySentence, setQuerySentence] = useState<string | null>(null)

    const { data, isLoading, error } = useQuery(
        say,
        querySentence !== null
            ? {
                sentence: querySentence,
            }
            : undefined,
        {
            enabled: querySentence !== null,
        },
    )

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (inputValue.trim()) {
            setQuerySentence(inputValue.trim())
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Connect Query (App Router)</h1>
            <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
                <div style={{ marginBottom: "1rem" }}>
                    <label htmlFor="sentence-input" style={{ display: "block", marginBottom: "0.5rem" }}>
                        Enter a sentence:
                    </label>
                    <input
                        id="sentence-input"
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            padding: "0.5rem",
                            fontSize: "1rem",
                            width: "100%",
                            maxWidth: "400px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginRight: "0.5rem",
                        }}
                        placeholder="Type a message..."
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                        padding: "0.5rem 1rem",
                        fontSize: "1rem",
                        backgroundColor: "#0070f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isLoading || !inputValue.trim() ? "not-allowed" : "pointer",
                        opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
                    }}
                >
                    {isLoading ? "Sending..." : "Send"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
            {data && (
                <div>
                    <h2>Response:</h2>
                    <p>{data.sentence}</p>
                </div>
            )}
        </div>
    )
}

