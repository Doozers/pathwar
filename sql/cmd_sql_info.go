package sql

import (
	"fmt"
	"log"

	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"go.uber.org/zap"

	"pathwar.land/entity"
	"pathwar.land/pkg/cli"
)

type infoOptions struct {
	sql Options `mapstructure:"sql"`

	// additional info filters
	// --anonymize
}

type infoCommand struct{ opts infoOptions }

func (cmd *infoCommand) CobraCommand(commands cli.Commands) *cobra.Command {
	cc := &cobra.Command{
		Use: "info",
		RunE: func(_ *cobra.Command, args []string) error {
			opts := cmd.opts
			opts.sql = GetOptions(commands)
			return runInfo(&opts)
		},
	}
	cmd.ParseFlags(cc.Flags())
	commands["sql"].ParseFlags(cc.Flags())
	return cc
}
func (cmd *infoCommand) LoadDefaultOptions() error { return viper.Unmarshal(&cmd.opts) }
func (cmd *infoCommand) ParseFlags(flags *pflag.FlagSet) {
	if err := viper.BindPFlags(flags); err != nil {
		zap.L().Warn("failed to bind viper flags", zap.Error(err))
	}
}

func runInfo(opts *infoOptions) error {
	fmt.Printf("database: %q\n", opts.sql.Config)
	db, err := FromOpts(&opts.sql)
	if err != nil {
		return err
	}

	for _, model := range entity.All() {
		var count int
		tableName := db.NewScope(model).TableName()
		if err := db.Model(model).Count(&count).Error; err != nil {
			log.Printf("failed to get count for %q: %v", tableName, err)
			continue
		}
		fmt.Printf("stats: %-20s %3d\n", tableName, count)
	}
	return nil
}
