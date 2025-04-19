"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BatchTranslationOptions() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Options for Very Large Translations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chunking">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="chunking">Chunking</TabsTrigger>
            <TabsTrigger value="background">Background Jobs</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
          </TabsList>

          <TabsContent value="chunking" className="space-y-4">
            <h3 className="font-medium">JSON Chunking</h3>
            <p className="text-sm text-slate-600">
              Break your large JSON file into smaller chunks and translate each chunk separately. This approach is
              already implemented in the application.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Pros: Simple to implement, works with existing API</li>
              <li>Cons: Still requires keeping the browser tab open</li>
            </ul>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <h3 className="font-medium">Background Processing</h3>
            <p className="text-sm text-slate-600">
              For very large files, consider implementing a server-side queue system that processes translations in the
              background and notifies you when complete.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Pros: Can handle extremely large files, no browser timeout issues</li>
              <li>Cons: Requires server-side implementation with a database</li>
            </ul>
            <Button variant="outline" className="mt-2">
              Learn More
            </Button>
          </TabsContent>

          <TabsContent value="streaming" className="space-y-4">
            <h3 className="font-medium">Streaming Responses</h3>
            <p className="text-sm text-slate-600">
              Use WebSockets or Server-Sent Events to stream translation results as they become available.
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              <li>Pros: Real-time updates, better user experience</li>
              <li>Cons: Requires both client and server implementation</li>
            </ul>
            <Button variant="outline" className="mt-2">
              Learn More
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
