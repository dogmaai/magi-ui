import { useEffect, useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { getLLMConfig, getSpecs, checkServiceHealth } from "@/services/api";

interface LLMModel {
  provider: string;
  model: string;
  temperature: number;
  role: string;
  specialty: string;
}

interface ServiceHealth {
  name: string;
  status: "online" | "offline" | "degraded";
  version?: string;
  latency: number;
}

export default function Settings() {
  const [llmConfig, setLLMConfig] = useState<Record<string, LLMModel>>({});
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [specsVersion, setSpecsVersion] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        // Load service health
        const serviceNames = ["magi-ac", "magi-sys", "magi-stg", "magi-executor", "magi-decision", "magi-moni"];
        const healthResults = await Promise.all(
          serviceNames.map(async (name) => {
            try {
              const result = await checkServiceHealth(name);
              return { 
                name, 
                status: result.status as "online" | "offline" | "degraded", 
                latency: result.latency 
              };
            } catch {
              return { name, status: "offline" as const, latency: 0 };
            }
          })
        );
        setServices(healthResults);

        // Load specs
        try {
          const specs = await getSpecs() as any;
          if (specs.version) setSpecsVersion(specs.version);
          if (specs.specifications?.["ai-models-config.json"]?.magi_sys) {
            setLLMConfig(specs.specifications["ai-models-config.json"].magi_sys);
          }
        } catch (err) {
          console.error("Failed to load specs:", err);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const llmModels = Object.entries(llmConfig).map(([key, value]) => ({
    unit: key.toUpperCase(),
    ...value,
  }));

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      {/* System Info */}
      <GlassCard title="System Information">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Specs Version</p>
            <p className="text-lg font-semibold text-foreground">{specsVersion || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Services</p>
            <p className="text-lg font-semibold text-foreground">{services.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Online</p>
            <p className="text-lg font-semibold text-green-400">
              {services.filter(s => s.status === "online").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Region</p>
            <p className="text-lg font-semibold text-foreground">asia-northeast1</p>
          </div>
        </div>
      </GlassCard>

      {/* Service Status */}
      <GlassCard title="Service Status">
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Service</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-right py-2">Latency</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc.name} className="border-b border-border/50">
                    <td className="py-3 font-mono">{svc.name}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        svc.status === "online" ? "bg-green-400/20 text-green-400" :
                        svc.status === "degraded" ? "bg-yellow-400/20 text-yellow-400" :
                        "bg-red-400/20 text-red-400"
                      }`}>
                        {svc.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-muted-foreground">
                      {svc.latency}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* LLM Configuration */}
      <GlassCard title="LLM Configuration (magi-sys)">
        {llmModels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Unit</th>
                  <th className="text-left py-2">Provider</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-center py-2">Temp</th>
                  <th className="text-left py-2">Role</th>
                </tr>
              </thead>
              <tbody>
                {llmModels.map((model) => (
                  <tr key={model.unit} className="border-b border-border/50">
                    <td className="py-3 font-mono font-semibold text-primary">{model.unit}</td>
                    <td className="py-3">{model.provider}</td>
                    <td className="py-3 font-mono text-xs">{model.model}</td>
                    <td className="py-3 text-center">{model.temperature}</td>
                    <td className="py-3 text-muted-foreground text-xs">{model.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {loading ? "Loading..." : "No LLM configuration found"}
          </div>
        )}
      </GlassCard>

      {/* Target Symbols */}
      <GlassCard title="Monitored Symbols">
        <div className="flex flex-wrap gap-2">
          {["AAPL", "NVDA", "GOOGL", "MSFT", "TSLA", "META", "AMZN"].map((symbol) => (
            <span
              key={symbol}
              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-mono"
            >
              {symbol}
            </span>
          ))}
        </div>
      </GlassCard>

      {/* API Endpoints */}
      <GlassCard title="API Endpoints">
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">magi-ui (this)</span>
            <span className="text-foreground">https://magi-ui-398890937507.asia-northeast1.run.app</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">magi-ac</span>
            <span className="text-foreground">/api/magi-ac/*</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">magi-sys</span>
            <span className="text-foreground">/api/magi-sys/*</span>
          </div>
          <div className="flex justify-between py-1 border-b border-border/50">
            <span className="text-muted-foreground">magi-stg</span>
            <span className="text-foreground">/api/magi-stg/*</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Constitution</span>
            <span className="text-foreground">/api/magi-stg/public/constitution</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
