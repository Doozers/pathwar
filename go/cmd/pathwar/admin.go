package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"strings"

	"github.com/dustin/go-humanize"
	"github.com/olekukonko/tablewriter"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"moul.io/godev"
	"pathwar.land/pathwar/v2/go/pkg/errcode"
	"pathwar.land/pathwar/v2/go/pkg/pwapi"
	"pathwar.land/pathwar/v2/go/pkg/pwdb"
)

func adminCommand() *ffcli.Command {
	var (
		adminFlags                     = flag.NewFlagSet("admin", flag.ExitOnError)
		adminChallengesFlags           = flag.NewFlagSet("admin challenges", flag.ExitOnError)
		adminUsersFlags                = flag.NewFlagSet("admin users", flag.ExitOnError)
		adminRedumpFlags               = flag.NewFlagSet("admin redump", flag.ExitOnError)
		adminChallengeAddFlags         = flag.NewFlagSet("admin challenge add", flag.ExitOnError)
		adminChallengeFlavorAddFlags   = flag.NewFlagSet("admin challenge flavor add", flag.ExitOnError)
		adminChallengeInstanceAddFlags = flag.NewFlagSet("admin challenge instance add", flag.ExitOnError)
		jsonFormat                     bool
	)
	adminFlags.StringVar(&httpAPIAddr, "http-api-addr", defaultHTTPApiAddr, "HTTP API address")
	adminFlags.StringVar(&ssoOpts.TokenFile, "sso-token-file", ssoOpts.TokenFile, "Token file")
	adminFlags.BoolVar(&jsonFormat, "json", false, "Print JSON and exit")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.Name, "name", "", "Challenge name")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.Description, "description", "", "Challenge description")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.Author, "author", "", "Challenge author")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.Locale, "locale", "", "Challenge Locale")
	adminChallengeAddFlags.BoolVar(&adminChallengeAddInput.Challenge.IsDraft, "is-draft", true, "Is challenge production ready ?")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.PreviewUrl, "preview-url", "", "Challenge preview URL")
	adminChallengeAddFlags.StringVar(&adminChallengeAddInput.Challenge.Homepage, "homepage", "", "Challenge homepage URL")
	adminChallengeFlavorAddFlags.StringVar(&adminChallengeFlavorAddInput.ChallengeFlavor.Version, "version", "1.0.0", "Challenge flavor version")
	adminChallengeFlavorAddFlags.StringVar(&adminChallengeFlavorAddInput.ChallengeFlavor.ComposeBundle, "compose-bundle", "", "Challenge flavor compose bundle")
	adminChallengeFlavorAddFlags.Int64Var(&adminChallengeFlavorAddInput.ChallengeFlavor.ChallengeID, "challenge-id", 0, "Challenge id")
	adminChallengeInstanceAddFlags.Int64Var(&adminChallengeInstanceAddInput.ChallengeInstance.AgentID, "agent-id", 0, "Id of the agent that will host the instance")
	adminChallengeInstanceAddFlags.Int64Var(&adminChallengeInstanceAddInput.ChallengeInstance.FlavorID, "flavor-id", 0, "Challenge flavor id")

	return &ffcli.Command{
		Name:  "admin",
		Usage: "pathwar [global flags] admin [admin flags] <subcommand> [flags] [args...]",
		Subcommands: []*ffcli.Command{{
			Name:    "challenges",
			Usage:   "pathwar [global flags] admin [admin flags] challenges [flags]",
			FlagSet: adminChallengesFlags,
			Exec: func(args []string) error {
				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminListChallenges(ctx, &pwapi.AdminListChallenges_Input{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				// tree
				{
					fmt.Println("TREE")
					for _, challenge := range ret.Challenges {
						fmt.Printf("- %s (%d)\n", challenge.Slug, challenge.ID)
						for _, flavor := range challenge.Flavors {
							fmt.Printf("  - %s (%d)\n", flavor.Slug, flavor.ID)
							for _, instance := range flavor.Instances {
								fmt.Printf("    - %d\n", instance.ID)
							}
						}
					}
					fmt.Println("")
				}

				// challenges table
				{
					fmt.Println("CHALLENGES")
					table := tablewriter.NewWriter(os.Stdout)
					table.SetHeader([]string{"CHALLENGE", "NAME", "AUTHOR", "CREATED", "UPDATED", "FLAVORS", "ID"})
					table.SetAlignment(tablewriter.ALIGN_CENTER)
					table.SetBorder(false)

					for _, challenge := range ret.Challenges {
						slug := challenge.Slug
						name := challenge.Name
						author := challenge.Author
						createdAgo := humanize.Time(*challenge.CreatedAt)
						updatedAgo := humanize.Time(*challenge.UpdatedAt)
						flavors := fmt.Sprintf("%d", len(challenge.Flavors))
						id := fmt.Sprintf("%d", challenge.ID)
						table.Append([]string{slug, name, author, createdAgo, updatedAgo, flavors, id})
					}
					table.Render()
					fmt.Println("")
				}

				// flavors table
				{
					fmt.Println("FLAVORS")
					table := tablewriter.NewWriter(os.Stdout)
					table.SetHeader([]string{"FLAVOR", "CHALLENGE", "CREATED", "UPDATED", "INSTANCES", "SEASON CHALLENGES", "ID"})
					table.SetAlignment(tablewriter.ALIGN_CENTER)
					table.SetBorder(false)

					for _, challenge := range ret.Challenges {
						for _, flavor := range challenge.Flavors {
							slug := flavor.Slug
							challengeSlug := challenge.Slug
							createdAgo := humanize.Time(*flavor.CreatedAt)
							updatedAgo := humanize.Time(*flavor.UpdatedAt)
							instanceGreen := 0
							instanceRed := 0
							for _, instance := range flavor.Instances {
								if instance.Status == pwdb.ChallengeInstance_Available {
									instanceGreen++
								} else {
									instanceRed++
								}
							}
							instanceParts := []string{}
							if instanceGreen > 0 {
								instanceParts = append(instanceParts, fmt.Sprintf("%dx🟢", instanceGreen))
							}
							if instanceRed > 0 {
								instanceParts = append(instanceParts, fmt.Sprintf("%dx🔴", instanceRed))
							}
							instances := strings.Join(instanceParts, " + ")
							if len(flavor.Instances) == 0 {
								instances = "🚫"
							}
							seasonChallengeParts := []string{}
							for _, seasonChallenge := range flavor.SeasonChallenges {
								seasonChallengeParts = append(seasonChallengeParts, seasonChallenge.Season.Slug)
							}
							seasonChallenges := strings.Join(seasonChallengeParts, ", ")
							id := fmt.Sprintf("%d", flavor.ID)
							table.Append([]string{slug, challengeSlug, createdAgo, updatedAgo, instances, seasonChallenges, id})
						}
					}
					table.Render()
					fmt.Println("")
				}

				// instances
				{
					fmt.Println("INSTANCES")
					table := tablewriter.NewWriter(os.Stdout)
					table.SetHeader([]string{"INSTANCE", "FLAVOR", "STATUS", "CREATED", "UPDATED", "CONFIG", "SEASON CHALLENGES", "PRICE/REWARD"})
					table.SetAlignment(tablewriter.ALIGN_CENTER)
					table.SetBorder(false)

					for _, challenge := range ret.Challenges {
						for _, flavor := range challenge.Flavors {
							for _, instance := range flavor.Instances {
								//fmt.Println(godev.PrettyJSONPB(instance))
								id := fmt.Sprintf("%d", instance.ID)
								status := instance.Status.String()
								switch status {
								case "Available":
									status += " 🟢"
								default:
									status += " 🔴"
								}
								flavorSlug := fmt.Sprintf("%s@%s", challenge.Slug, flavor.Slug)
								createdAgo := humanize.Time(*instance.CreatedAt)
								updatedAgo := humanize.Time(*instance.UpdatedAt)
								configStruct, _ := instance.ParseInstanceConfig()
								config := godev.JSONPB(configStruct)
								seasonChallenges := fmt.Sprintf("%d", len(flavor.SeasonChallenges))
								price := "free"
								if flavor.PurchasePrice > 0 {
									price = fmt.Sprintf("$%d", flavor.PurchasePrice)
								}
								priceReward := fmt.Sprintf("%s / $%d", price, flavor.ValidationReward)
								table.Append([]string{id, flavorSlug, status, createdAgo, updatedAgo, config, seasonChallenges, priceReward})
							}
						}
					}
					table.Render()
				}

				return nil
			},
		}, {
			Name:    "users",
			Usage:   "pathwar [global flags] admin [admin flags] users [flags]",
			FlagSet: adminUsersFlags,
			Exec: func(args []string) error {
				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminListUsers(ctx, &pwapi.AdminListUsers_Input{})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				// users table
				{
					fmt.Println("USERS")
					table := tablewriter.NewWriter(os.Stdout)
					table.SetHeader([]string{"USER", "STATUS", "USERNAME", "EMAIL", "CREATED", "UPDATED", "TEAMS", "ORGS", "ID"})
					table.SetAlignment(tablewriter.ALIGN_CENTER)
					table.SetBorder(false)

					for _, user := range ret.Users {
						//fmt.Println(godev.PrettyJSONPB(user))
						slug := user.Slug
						email := user.Email
						username := user.Username
						status := user.DeletionStatus.String()
						switch status {
						case "Active":
							status += " 🟢"
						default:
							status += " 🔴"
						}
						createdAgo := humanize.Time(*user.CreatedAt)
						updatedAgo := humanize.Time(*user.UpdatedAt)
						teams := fmt.Sprintf("%d", len(user.TeamMemberships))
						orgs := fmt.Sprintf("%d", len(user.OrganizationMemberships))
						id := fmt.Sprintf("%d", user.ID)
						table.Append([]string{slug, status, username, email, createdAgo, updatedAgo, teams, orgs, id})
					}
					table.Render()
					fmt.Println("")
				}

				return nil
			},
		}, {
			Name:    "redump",
			Usage:   "pathwar [global flags] admin [admin flags] redump [flags] ID...",
			FlagSet: adminRedumpFlags,
			Exec: func(args []string) error {
				if len(args) < 1 {
					return flag.ErrHelp
				}

				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminRedump(ctx, &pwapi.AdminRedump_Input{
					Identifiers: args,
				})
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				fmt.Println("OK")

				return nil
			},
		}, {
			Name:      "challenge-add",
			Usage:     "pathwar [global flags] admin [admin flags] challenge-add [flags] [args...]",
			ShortHelp: "add a challenge",
			FlagSet:   adminChallengeAddFlags,
			Exec: func(args []string) error {
				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminAddChallenge(ctx, &adminChallengeAddInput)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if globalDebug {
					fmt.Fprintln(os.Stderr, godev.PrettyJSONPB(&ret))
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				fmt.Println(ret.Challenge.ID)
				return nil
			},
		}, {
			Name:      "challenge-flavor-add",
			Usage:     "pathwar [global flags] admin [admin flags] challenge-flavor-add [flags] [args...]",
			ShortHelp: "add a challenge flavor",
			FlagSet:   adminChallengeFlavorAddFlags,
			Exec: func(args []string) error {
				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminAddChallengeFlavor(ctx, &adminChallengeFlavorAddInput)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if globalDebug {
					fmt.Fprintln(os.Stderr, godev.PrettyJSONPB(&ret))
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				fmt.Println(ret.ChallengeFlavor.ID)
				return nil
			},
		}, {
			Name:      "challenge-instance-add",
			Usage:     "pathwar [global flags] admin [admin flags] challenge-instance-add [flags] [args...]",
			ShortHelp: "add a challenge instance",
			FlagSet:   adminChallengeInstanceAddFlags,
			Exec: func(args []string) error {
				if err := globalPreRun(); err != nil {
					return err
				}

				ctx := context.Background()
				apiClient, err := httpClientFromEnv(ctx)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				ret, err := apiClient.AdminAddChallengeInstance(ctx, &adminChallengeInstanceAddInput)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				if globalDebug {
					fmt.Fprintln(os.Stderr, godev.PrettyJSONPB(&ret))
				}

				if jsonFormat {
					fmt.Println(godev.PrettyJSONPB(&ret))
					return nil
				}

				fmt.Println(ret.ChallengeInstance.ID)
				return nil
			},
		}},
		ShortHelp: "admin commands",
		FlagSet:   adminFlags,
		Options:   []ff.Option{ff.WithEnvVarNoPrefix()},
		Exec:      func([]string) error { return flag.ErrHelp },
	}
}
