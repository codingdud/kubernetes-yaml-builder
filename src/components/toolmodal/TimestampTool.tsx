import React, { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format, formatISO, parseISO, formatDistanceToNow, isValid } from 'date-fns';
import cronstrue from 'cronstrue'; 
import { CronExpressionParser } from 'cron-parser';

const TimestampTool: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputTimestamp, setInputTimestamp] = useState("");
  const [humanizedDuration, setHumanizedDuration] = useState("");
  
  // Cron Translator states
  const [cronExpression, setCronExpression] = useState("");
  const [cronDescription, setCronDescription] = useState("");
  const [nextCronOccurrences, setNextCronOccurrences] = useState("");

  // Cron Builder states
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [generatedCron, setGeneratedCron] = useState("");

  const [copiedField, setCopiedField] = useState<string | null>(null); // New state for copy feedback

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputTimestamp(e.target.value);
    try {
      const date = parseISO(e.target.value);
      if (isValid(date)) {
        setHumanizedDuration(formatDistanceToNow(date, { addSuffix: true }));
      } else {
        setHumanizedDuration("Invalid Date");
      }
    } catch {
      setHumanizedDuration("Invalid Date Format");
    }
  };

  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const expression = e.target.value;
    setCronExpression(expression);
    
    try {
      setCronDescription(cronstrue.toString(expression));
      const interval = CronExpressionParser.parse(expression);
      let occurrences = [];
      for (let i = 0; i < 5; i++) { // Get next 5 occurrences
        occurrences.push(formatISO(interval.next().toDate()));
      }
      setNextCronOccurrences(occurrences.join('\n'));
    } catch (error: any) {
      setCronDescription(`Invalid cron expression: ${error.message}`);
      setNextCronOccurrences("");
    }
  };

  const generateCronExpression = () => {
    const cron = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
    setGeneratedCron(cron);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timestamp Helper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Time */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Time</label>
          <div className="flex items-center space-x-2">
            <Textarea
              value={`Now: ${format(currentTime, 'yyyy-MM-dd HH:mm:ss')}\nISO8601: ${formatISO(currentTime)}`}
              readOnly
              rows={2}
              className="flex-grow"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(formatISO(currentTime), "iso")}
              className="h-8 px-2"
            >
              {copiedField === "iso" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedField === "iso" ? "Copied" : "Copy ISO"}
            </Button>
          </div>
        </div>

        {/* Humanize Duration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Humanize Duration (ISO8601 or valid date string)</label>
          <Textarea
            value={inputTimestamp}
            onChange={handleTimestampChange}
            placeholder="e.g., 2023-10-27T10:00:00Z or 2023-10-27"
            rows={2}
          />
          <div className="flex items-center space-x-2">
            <Textarea
              value={humanizedDuration}
              readOnly
              placeholder="Humanized duration will appear here..."
              rows={1}
              className="flex-grow"
            />
            {humanizedDuration && humanizedDuration !== "Invalid Date" && humanizedDuration !== "Invalid Date Format" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(humanizedDuration, "humanized")}
                className="h-8 px-2"
              >
                {copiedField === "humanized" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copiedField === "humanized" ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
        </div>

        {/* Cron Section */}
        <Tabs defaultValue="cronTranslator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cronTranslator">Cron to Human/Occurrences</TabsTrigger>
            <TabsTrigger value="cronBuilder">Human to Cron (Builder)</TabsTrigger>
          </TabsList>

          <TabsContent value="cronTranslator" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cron Expression</label>
              <Textarea
                value={cronExpression}
                onChange={handleCronExpressionChange}
                placeholder="e.g., 0 0 * * *"
                rows={2}
              />
              <div className="flex items-center space-x-2">
                <Textarea
                  value={cronDescription}
                  readOnly
                  placeholder="Cron description will appear here..."
                  rows={2}
                  className="flex-grow"
                />
                {cronDescription && cronDescription.startsWith("Invalid cron expression") === false && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cronDescription, "description")}
                    className="h-8 px-2"
                  >
                    {copiedField === "description" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copiedField === "description" ? "Copied" : "Copy Description"}
                  </Button>
                )}
              </div>
              {nextCronOccurrences && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Next Occurrences (ISO8601)</label>
                  <div className="flex items-center space-x-2">
                    <Textarea
                      value={nextCronOccurrences}
                      readOnly
                      rows={5}
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(nextCronOccurrences, "occurrences")}
                      className="h-8 px-2"
                    >
                      {copiedField === "occurrences" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copiedField === "occurrences" ? "Copied" : "Copy Occurrences"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cronBuilder" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minute (0-59 or *)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="*"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hour (0-23 or *)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="*"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Day of Month (1-31 or *)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="*"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Month (1-12 or *)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="*"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Day of Week (0-7 or *)</label>
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="*"
                />
              </div>
            </div>
            <Button onClick={generateCronExpression} className="w-full">
              Generate Cron Expression
            </Button>
            <div className="space-y-2">
              <label className="text-sm font-medium">Generated Cron</label>
              <div className="flex items-center space-x-2">
                <Textarea
                  value={generatedCron}
                  readOnly
                  placeholder="Generated cron expression will appear here..."
                  rows={1}
                  className="flex-grow"
                />
                {generatedCron && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedCron, "generatedCron")}
                    className="h-8 px-2"
                  >
                    {copiedField === "generatedCron" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    {copiedField === "generatedCron" ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimestampTool;
